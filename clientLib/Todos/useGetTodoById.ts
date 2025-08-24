import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { TodoWithRelations } from "../../schema/Todos";

const fetchTodoById = async (id: number): Promise<TodoWithRelations> => {
  const response = await axios.get(`/api/todos/${id}`);
  return response.data;
};

export const useGetTodoById = (id: number) => {
  return useQuery({
    queryKey: ["todo", id],
    queryFn: () => fetchTodoById(id),
    enabled: !!id, // Only run query when id is provided
  });
};
