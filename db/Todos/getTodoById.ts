import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";

export async function getTodoById(id: number): Promise<Todo | null> {
  return await prisma.todo.findUnique({
    where: {
      id,
    },
    include: {
      dependencies: true,
      dependents: true,
    },
  });
}
