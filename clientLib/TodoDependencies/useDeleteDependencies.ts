import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface DeleteDependenciesResult {
  message: string;
  todoId: number;
  requested: number[];
  successful: number[];
  errors: Array<{
    dependencyId: number;
    reason: string;
  }>;
}

interface DeleteDependenciesInput {
  dependencyIds: number[];
  childTodoId: number;
}

const deleteDependencies = async ({
  dependencyIds,
  childTodoId,
}: DeleteDependenciesInput): Promise<DeleteDependenciesResult> => {
  const response = await axios.delete(
    `/api/todos/${childTodoId}/dependencies?dependencyIds=${dependencyIds.join(
      ","
    )}`
  );
  return response.data as DeleteDependenciesResult;
};

export const useDeleteDependencies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDependencies,
    onSuccess: (_, variables) => {
      // Invalidate and refetch todos after successful dependency deletion
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      // Also invalidate the specific todo that was modified
      queryClient.invalidateQueries({
        queryKey: ["todo", variables.childTodoId],
      });
      // Invalidate critical path since dependencies changed
      queryClient.invalidateQueries({ queryKey: ["criticalPath"] });
    },
  });
};
