import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateTodoStatusParams {
  id: number;
  status: string;
}

interface UpdateTodoStatusResponse {
  id: number;
  status: string;
}

export function useUpdateTodoStatusById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: UpdateTodoStatusParams): Promise<UpdateTodoStatusResponse> => {
      const response = await fetch(`/api/todos/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update todo status");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the specific todo
      queryClient.invalidateQueries({ queryKey: ["todo", variables.id] });
      // Also invalidate the todos list to reflect changes
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
