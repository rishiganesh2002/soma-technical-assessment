import { prisma } from "../../lib/prisma";

export async function updateTodoStatusById(
  id: number,
  status: string
): Promise<{ id: number; status: string } | null> {
  try {
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return updatedTodo;
  } catch (error) {
    console.error(`Error updating todo status for ID ${id}:`, error);
    return null;
  }
}
