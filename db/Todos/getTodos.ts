import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";

export async function getTodos(): Promise<Todo[]> {
  return await prisma.todo.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      dependencies: true,
      dependents: true,
    },
  });
}
