import { Todo } from "@prisma/client";

/**
 * Sorts todos by due date from earliest to latest
 * @param todos - Array of todos to sort
 * @returns New sorted array (original array is not mutated)
 */
export const sortTodosByDate = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });
};
