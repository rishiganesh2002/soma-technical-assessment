import type { TodoWithRelations } from "../../schema/Todos";
import type { TodoDependency } from "@prisma/client";
import { detectCycle } from "./detectCycle";

export type EstimatedStartDatesResult = Array<{
  id: number;
  earliestStartDate: Date;
}>;

export function calculateEstimatedStartDates(
  todos: TodoWithRelations[],
  dependencies: TodoDependency[]
): EstimatedStartDatesResult {
  // Trivial case
  if (todos.length === 0) return [];

  // Defensive: detect cycles up-front
  try {
    detectCycle(
      todos.map((t) => ({ id: t.id })),
      dependencies.map((d) => ({
        parentTodo: d.parentTodo,
        childTodo: d.childTodo,
      }))
    );
  } catch (err) {
    // Re-throw with context
    throw new Error(
      "Dependency cycle detected while computing earliest start dates"
    );
  }

  // Base start date (now) normalized to start-of-day UTC
  const toStartOfDayUTC = (d: Date): Date =>
    new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
    );
  const now = toStartOfDayUTC(new Date());

  // Index todos by id and capture duration
  const todoById = new Map<number, TodoWithRelations>();
  const durationById = new Map<number, number>();
  for (const t of todos) {
    todoById.set(t.id, t);
    const days = (t as any)?.estimatedCompletionDays;
    durationById.set(t.id, Number.isFinite(days) && days > 0 ? days : 1);
  }

  // Build adjacency and indegree for topological order
  const childrenMap = new Map<number, number[]>();
  const parentsMap = new Map<number, number[]>();
  const indegree = new Map<number, number>();

  for (const t of todos) {
    childrenMap.set(t.id, []);
    parentsMap.set(t.id, []);
    indegree.set(t.id, 0);
  }

  for (const dep of dependencies) {
    if (!todoById.has(dep.parentTodo) || !todoById.has(dep.childTodo)) {
      // Ignore edges that refer to non-existent vertices
      continue;
    }
    childrenMap.get(dep.parentTodo)!.push(dep.childTodo);
    parentsMap.get(dep.childTodo)!.push(dep.parentTodo);
    indegree.set(dep.childTodo, (indegree.get(dep.childTodo) || 0) + 1);
  }

  // Earliest start/finish maps
  const earliestStart = new Map<number, Date>();
  const earliestFinish = new Map<number, Date>();

  // Kahn's algorithm queue (nodes with no incoming edges)
  const queue: number[] = [];
  indegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  // Helper: add N calendar days in UTC keeping time at 00:00:00Z
  const addDaysUTC = (date: Date, days: number): Date => {
    const base = toStartOfDayUTC(date);
    const result = new Date(base.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return toStartOfDayUTC(result);
  };

  let processedCount = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    processedCount++;

    const parentIds = parentsMap.get(nodeId) || [];

    // Compute earliest start: max(now, max parent earliestFinish)
    let nodeEarliestStart = now;
    for (let i = 0; i < parentIds.length; i++) {
      const pId = parentIds[i];
      const pFinish = earliestFinish.get(pId);
      if (pFinish && pFinish.getTime() > nodeEarliestStart.getTime()) {
        nodeEarliestStart = pFinish;
      }
    }

    const durationDays = durationById.get(nodeId) || 1;
    const nodeEarliestFinish = addDaysUTC(nodeEarliestStart, durationDays);
    earliestStart.set(nodeId, toStartOfDayUTC(nodeEarliestStart));
    earliestFinish.set(nodeId, nodeEarliestFinish);

    // Push children when indegree hits zero
    const children = childrenMap.get(nodeId) || [];
    for (let i = 0; i < children.length; i++) {
      const cId = children[i];
      const newDeg = (indegree.get(cId) || 0) - 1;
      indegree.set(cId, newDeg);
      if (newDeg === 0) queue.push(cId);
    }
  }

  // If not all nodes processed, there is a cycle
  if (processedCount !== todos.length) {
    throw new Error(
      "Dependency cycle detected while computing earliest start dates"
    );
  }

  // Prepare result for all nodes
  const result: EstimatedStartDatesResult = todos.map((t) => ({
    id: t.id,
    earliestStartDate: earliestStart.get(t.id) || now,
  }));

  return result;
}
