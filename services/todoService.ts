import { Todo } from "@prisma/client";
import type { TodoWithRelations } from "../schema/Todos";
import { TodoInput } from "../schema/Todos";
import { getTodos, createTodo, getTodoById, deleteTodoById } from "../db/Todos";
import { createTodoDependencies } from "../db/TodoDependencies/createTodoDependencies";
import { getAllTodoDependencies } from "../db/TodoDependencies/getAllTodoDependencies";
import { deleteTodoDependencies } from "../db/TodoDependencies/deleteTodoDependencies";
import { detectCycle, type GraphEdge } from "../utils/server/detectCycle";
import {
  calculateCriticalPath,
  type CriticalPathResult,
} from "../utils/server/calculateCriticalPath";

export class TodoService {
  async getTodos(): Promise<TodoWithRelations[]> {
    return await getTodos();
  }

  async createTodo(todo: TodoInput): Promise<Todo> {
    // First create the todo
    const createdTodo = await createTodo(todo);

    // If there are dependencies, create them
    if (todo.dependencies && todo.dependencies.length > 0) {
      await createTodoDependencies(createdTodo.id, todo.dependencies);
    }

    return createdTodo;
  }

  async getTodoById(id: number): Promise<TodoWithRelations | null> {
    return await getTodoById(id);
  }

  async deleteTodoById(id: number): Promise<Todo | null> {
    return await deleteTodoById(id);
  }

  async addDependenciesToTodo(
    childTodoId: number,
    dependencies: number[]
  ): Promise<{
    successfulDependencies: number[];
    errors: Array<{ dependencyId: number; reason: string }>;
  }> {
    // Retrieve all todos once (vertices don't change)
    const allTodos = await this.getTodos();

    // Track errors for dependencies that can't be added
    const errors: Array<{ dependencyId: number; reason: string }> = [];
    const successfulDependencies: number[] = [];

    // Iterate through each proposed dependency
    for (const dependencyId of dependencies) {
      try {
        // Get fresh dependencies on each iteration since we may have added new ones
        const currentDependencies = await getAllTodoDependencies();

        // Build the set of current edges (parentTodo -> childTodo pairs)
        const currentEdges = currentDependencies.map((dep) => ({
          parentTodo: dep.parentTodo,
          childTodo: dep.childTodo,
        }));

        // Add the proposed new edge
        const proposedEdge = {
          parentTodo: dependencyId, // The dependency becomes the parent
          childTodo: childTodoId, // The current todo becomes the child
        };

        // Combine current edges with the proposed edge for graph building
        const edgesForGraph: GraphEdge[] = [...currentEdges, proposedEdge];

        // TODO: Implement the validation and addition logic for each dependency
        // 1. ✅ Create proposed new edge (childTodoId -> dependencyId) - DONE
        // 2. Build graph with proposed edge using edgesForGraph - DONE
        // 3. Run DFS to check for cycles
        const vertices = allTodos.map((t) => ({ id: t.id }));
        detectCycle(vertices, edgesForGraph);

        // 4. If no cycle, add to database (to be implemented next)
        // await createTodoDependency(childTodoId, dependencyId)
        successfulDependencies.push(dependencyId);
      } catch (error) {
        // Keep logs concise; avoid printing full stacks in dev console
        const reason = error instanceof Error ? error.message : "Unknown error";
        console.warn(`Failed dependency ${dependencyId}: ${reason}`);
        errors.push({
          dependencyId,
          reason,
        });
      }
    }

    // Persist successful dependencies in batch
    if (successfulDependencies.length > 0) {
      await createTodoDependencies(childTodoId, successfulDependencies);
    }

    return { successfulDependencies, errors };
  }

  async deleteDependenciesFromTodo(dependencyIds: number[]): Promise<{
    successfulDependencies: number[];
    errors: Array<{ dependencyId: number; reason: string }>;
  }> {
    if (dependencyIds.length === 0) {
      return { successfulDependencies: [], errors: [] };
    }

    try {
      // Delete the dependencies
      const deletedCount = await deleteTodoDependencies(dependencyIds);

      if (deletedCount === dependencyIds.length) {
        // All dependencies were successfully deleted
        return {
          successfulDependencies: dependencyIds,
          errors: [],
        };
      } else {
        // Some dependencies couldn't be deleted
        const successful = dependencyIds.slice(0, deletedCount);
        const failed = dependencyIds.slice(deletedCount);

        return {
          successfulDependencies: successful,
          errors: failed.map((id) => ({
            dependencyId: id,
            reason: "Dependency not found or could not be deleted",
          })),
        };
      }
    } catch (error) {
      // All dependencies failed to delete
      return {
        successfulDependencies: [],
        errors: dependencyIds.map((id) => ({
          dependencyId: id,
          reason: error instanceof Error ? error.message : "Unknown error",
        })),
      };
    }
  }

  async calculateCriticalPath(): Promise<CriticalPathResult> {
    try {
      // Step 1: Retrieve all todos and todo dependencies
      const todos = await this.getTodos();
      const dependencies = await getAllTodoDependencies();

      console.log("Retrieved todos:", todos.length);
      console.log("Retrieved dependencies:", dependencies.length);

      // Step 2: Feed this into calculateCriticalPath helper function
      const result = calculateCriticalPath(todos, dependencies);

      // Step 3 & 4: Return the complete structured data for UI visualization
      return result;
    } catch (error) {
      console.error("Error in calculateCriticalPath:", error);
      throw error;
    }
  }
}

// Export a singleton instance to avoid creating multiple instances
export const todoService = new TodoService();
