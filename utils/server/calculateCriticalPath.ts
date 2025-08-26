import type { TodoWithRelations } from "../../schema/Todos";
import type { TodoDependency } from "@prisma/client";

export interface CriticalPathResult {
  criticalPath: Array<{
    id: number;
    title: string;
    estimatedCompletionDays: number;
    isCritical: boolean;
    earliestPossibleStartDate: Date | null;
  }>;
  totalDuration: number;
  // All nodes with critical path marking
  allNodes: Array<{
    id: number;
    title: string;
    estimatedCompletionDays: number;
    isCritical: boolean;
    earliestPossibleStartDate: Date | null;
  }>;
  // All edges with critical path marking
  allEdges: Array<{
    parentTodo: number;
    childTodo: number;
    isCritical: boolean;
  }>;
}

export function calculateCriticalPath(
  todos: TodoWithRelations[],
  dependencies: TodoDependency[]
): CriticalPathResult {
  if (todos.length === 0) {
    return {
      criticalPath: [],
      totalDuration: 0,
      allNodes: [],
      allEdges: [],
    };
  }

  // Find tasks with no dependencies (start nodes)
  const startNodes = todos.filter((todo) => todo.dependencies.length === 0);

  if (startNodes.length === 0) {
    // All tasks have dependencies - might be a cycle
    return {
      criticalPath: [],
      totalDuration: 0,
      allNodes: todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        estimatedCompletionDays: (todo as any)?.estimatedCompletionDays || 1,
        isCritical: false,
        earliestPossibleStartDate: todo.earliestPossibleStartDate,
      })),
      allEdges: dependencies.map((dep) => ({
        parentTodo: dep.parentTodo,
        childTodo: dep.childTodo,
        isCritical: false,
      })),
    };
  }

  // Precompute adjacency and lookup maps for efficiency
  const childrenMap = new Map<number, number[]>();
  for (const dep of dependencies) {
    const list = childrenMap.get(dep.parentTodo);
    if (list) {
      list.push(dep.childTodo);
    } else {
      childrenMap.set(dep.parentTodo, [dep.childTodo]);
    }
  }

  const todoById = new Map<number, TodoWithRelations>();
  for (const t of todos) {
    todoById.set(t.id, t);
  }

  const bestFrom = new Map<number, { path: number[]; duration: number }>();

  // Calculate longest path from each start node
  let longestPath: number[] = [];
  let maxDuration = 0;

  for (const startNode of startNodes) {
    const { path, duration } = findLongestPathFromNode(
      startNode.id,
      childrenMap,
      todoById,
      new Set(),
      bestFrom
    );
    if (duration > maxDuration) {
      maxDuration = duration;
      longestPath = path;
    }
  }

  // Handle case where no valid path was found (e.g., isolated tasks)
  if (longestPath.length === 0) {
    // If no path found, mark the longest single task as critical
    const longestTask = todos.reduce(
      (max, todo) => {
        const duration = (todo as any)?.estimatedCompletionDays || 1;
        return duration > max.duration ? { id: todo.id, duration } : max;
      },
      { id: 0, duration: 0 }
    );

    longestPath = [longestTask.id];
    maxDuration = longestTask.duration;
  }

  // Build the critical path result
  const criticalPath = longestPath.map((nodeId) => {
    const todo = todoById.get(nodeId);
    return {
      id: nodeId,
      title: todo?.title || "Unknown Task",
      estimatedCompletionDays: todo?.estimatedCompletionDays || 1,
      isCritical: true,
      earliestPossibleStartDate: todo?.earliestPossibleStartDate || null,
    };
  });

  // Mark all nodes with critical path flag
  const allNodes = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    estimatedCompletionDays: todo.estimatedCompletionDays || 1,
    isCritical: longestPath.includes(todo.id),
    earliestPossibleStartDate: todo.earliestPossibleStartDate || null,
  }));

  // Mark all edges with critical path flag
  const allEdges = dependencies.map((dep) => ({
    parentTodo: dep.parentTodo,
    childTodo: dep.childTodo,
    isCritical: isEdgeOnCriticalPath(
      dep.parentTodo,
      dep.childTodo,
      longestPath
    ),
  }));

  return {
    criticalPath,
    totalDuration: maxDuration,
    allNodes,
    allEdges,
  };
}

function findLongestPathFromNode(
  nodeId: number,
  childrenMap: Map<number, number[]>,
  todoById: Map<number, TodoWithRelations>,
  visited: Set<number>,
  memo: Map<number, { path: number[]; duration: number }>
): { path: number[]; duration: number } {
  if (memo.has(nodeId)) {
    return memo.get(nodeId)!;
  }

  if (visited.has(nodeId)) {
    return { path: [], duration: 0 };
  }

  visited.add(nodeId);
  const currentTodo = todoById.get(nodeId);
  if (!currentTodo) {
    visited.delete(nodeId);
    return { path: [], duration: 0 };
  }

  const currentDuration = (currentTodo as any)?.estimatedCompletionDays || 1;
  let maxPath = [nodeId];
  let maxDuration = currentDuration;

  const children = childrenMap.get(nodeId) ?? [];

  for (const childId of children) {
    const { path: subPath, duration: subDuration } = findLongestPathFromNode(
      childId,
      childrenMap,
      todoById,
      new Set(visited),
      memo
    );

    const totalDuration = currentDuration + subDuration;
    if (totalDuration > maxDuration) {
      maxPath = [nodeId, ...subPath];
      maxDuration = totalDuration;
    }
  }

  visited.delete(nodeId);
  const result = { path: maxPath, duration: maxDuration };
  memo.set(nodeId, result);
  return result;
}

function isEdgeOnCriticalPath(
  parentTodo: number,
  childTodo: number,
  criticalPath: number[]
): boolean {
  // Check if this edge is part of the critical path
  // An edge is critical if both parent and child are on the critical path
  // and they appear consecutively in the path
  for (let i = 0; i < criticalPath.length - 1; i++) {
    if (criticalPath[i] === parentTodo && criticalPath[i + 1] === childTodo) {
      return true;
    }
  }
  return false;
}
