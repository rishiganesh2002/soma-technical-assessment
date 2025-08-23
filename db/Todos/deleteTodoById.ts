import { prisma } from "../../lib/prisma";
import { Todo } from "@prisma/client";

export async function deleteTodoById(id: number): Promise<Todo | null> {
  return await prisma.todo.delete({
    where: {
      id,
    },
  });
}
