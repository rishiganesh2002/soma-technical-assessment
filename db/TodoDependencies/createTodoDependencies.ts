import { prisma } from "../../lib/prisma";

export async function createTodoDependencies(
  childId: number,
  parentIds: number[]
): Promise<void> {
  if (parentIds.length === 0) {
    return;
  }

  // Create multiple TodoDependency records
  await prisma.todoDependency.createMany({
    data: parentIds.map((parentId) => ({
      parentTodo: parentId,
      childTodo: childId,
    })),
  });
}
