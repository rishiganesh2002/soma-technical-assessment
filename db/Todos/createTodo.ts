import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";
import { CreateTodoInput } from "../../schema/Todos";

export async function createTodo(todo: CreateTodoInput): Promise<Todo> {
  // Ensure the dueDate is treated as a local date at midnight
  // The client sends ISO string, but we want to preserve the user's intended date
  const dueDate = new Date(todo.dueDate);

  return await prisma.todo.create({
    data: {
      title: todo.title,
      dueDate: dueDate,
      imageUrl: todo.imageUrl,
      imageAlt: todo.imageAlt,
      estimatedCompletionDays: todo.estimatedCompletionDays,
    },
  });
}
