import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface AddDependenciesResult {
  message: string;
  todoId: number;
  requested: number[];
  successful: number[];
  errors: { dependencyId: number; reason: string }[];
}

interface AddDependenciesInput {
  dependencies: number[];
  childTodoId: number;
}

const addDependencies = async ({
  dependencies,
  childTodoId,
}: AddDependenciesInput): Promise<AddDependenciesResult> => {
  const response = await axios.post(`/api/todos/${childTodoId}/dependencies`, {
    dependencies,
  });
  return response.data as AddDependenciesResult;
};

export const useAddDependencies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDependencies,
    onSuccess: () => {
      // Invalidate and refetch todos after successful dependency addition
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
