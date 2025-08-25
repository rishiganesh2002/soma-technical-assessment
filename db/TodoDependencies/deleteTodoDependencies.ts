import { prisma } from "../../lib/prisma";

export async function deleteTodoDependencies(
  dependencyIds: number[]
): Promise<number> {
  if (dependencyIds.length === 0) {
    return 0;
  }

  const result = await prisma.todoDependency.deleteMany({
    where: {
      id: {
        in: dependencyIds,
      },
    },
  });

  return result.count;
}
