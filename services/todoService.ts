import { Todo } from "@prisma/client";
import { TodoInput } from "../schema/Todos";
import { getTodos, createTodo, getTodoById, deleteTodoById } from "../db/Todos";

export class TodoService {
  async getTodos(): Promise<Todo[]> {
    return await getTodos();
  }

  async createTodo(todo: TodoInput): Promise<Todo> {
    return await createTodo(todo);
  }

  async getTodoById(id: number): Promise<Todo | null> {
    return await getTodoById(id);
  }

  async deleteTodoById(id: number): Promise<Todo | null> {
    return await deleteTodoById(id);
  }
}
