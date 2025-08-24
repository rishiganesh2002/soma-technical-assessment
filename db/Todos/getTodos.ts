import { prisma } from "../../lib/prisma";
import type { TodoWithRelations } from "../../schema/Todos";

export async function getTodos(): Promise<TodoWithRelations[]> {
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
