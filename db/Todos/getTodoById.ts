import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";

export async function getTodoById(id: number): Promise<Todo | null> {
  return await prisma.todo.findUnique({
    where: {
      id,
    },
    include: {
      // Include parent tasks (dependencies)
      parentTodos: {
        include: {
          parent: true,
        },
      },
      // Include child tasks (dependents)
      childTodos: {
        include: {
          child: true,
        },
      },
    },
  });
}
