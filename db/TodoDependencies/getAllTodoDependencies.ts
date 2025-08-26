import { prisma } from "../../lib/prisma";
import type { TodoDependency } from "@prisma/client";

export async function getAllTodoDependencies(): Promise<TodoDependency[]> {
  return await prisma.todoDependency.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
