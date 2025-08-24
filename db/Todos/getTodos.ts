import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";

export async function getTodos(): Promise<Todo[]> {
  return await prisma.todo.findMany({
    orderBy: {
      createdAt: "desc",
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
