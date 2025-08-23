import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Todo } from "@prisma/client";
import { CreateTodoInput } from "../../schema/Todos";

const createTodo = async (todo: CreateTodoInput): Promise<Todo> => {
  const response = await axios.post("/api/todos", todo);
  return response.data;
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate and refetch todos after successful creation
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
