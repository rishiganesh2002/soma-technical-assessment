import { prisma } from "../../lib/prisma";
import type { TodoWithRelations } from "../../schema/Todos";

export async function getTodoById(
  id: number
): Promise<TodoWithRelations | null> {
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
