import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";
import { CreateTodoInput } from "../../schema/Todos";

export async function createTodo(todo: CreateTodoInput): Promise<Todo> {
  return await prisma.todo.create({
    data: {
      title: todo.title,
    },
  });
}
