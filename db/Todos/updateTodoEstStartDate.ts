import { prisma } from "../../lib/prisma";
import type { EstimatedStartDatesResult } from "../../utils/server/calculateEstimatedStartDates";

export async function updateTodoEstStartDate(
  estimatedStartDates: EstimatedStartDatesResult
): Promise<void> {
  // Update each todo individually since each needs a different earliestPossibleStartDate
  const updatePromises = estimatedStartDates.map((item) =>
    prisma.todo.update({
      where: { id: item.id },
      data: { earliestPossibleStartDate: item.earliestStartDate },
    })
  );

  // Wait for all updates to complete
  await Promise.all(updatePromises);
}
