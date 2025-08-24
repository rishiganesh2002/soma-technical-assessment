import { Todo } from "@prisma/client";
import type { TodoWithRelations } from "../schema/Todos";
import { TodoInput } from "../schema/Todos";
import { getTodos, createTodo, getTodoById, deleteTodoById } from "../db/Todos";
import { createTodoDependencies } from "../db/TodoDependencies/createTodoDependencies";

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
}
