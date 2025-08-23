/**
 * Checks if a todo's due date is past the current date and time
 * @param dueDate - The due date from the todo (ISO string or Date object)
 * @returns true if the due date is in the past, false if it's today or in the future
 */
export function isPastDueDate(dueDate: string | Date): boolean {
  const due = new Date(dueDate);
  const now = new Date();

  // Reset time to start of day for comparison (ignore time of day)
  const dueStartOfDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );
  const nowStartOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // If due date is before today, it's past due
  return dueStartOfDay < nowStartOfDay;
}
