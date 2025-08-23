import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Todo } from "@prisma/client";

const deleteTodo = async (id: number): Promise<Todo> => {
  const response = await axios.delete(`/api/todos/${id}`);
  return response.data.todo;
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      // Invalidate and refetch todos after successful deletion
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
