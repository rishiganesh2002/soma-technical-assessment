import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { TodoWithRelations } from "../../schema/Todos";

const fetchTodos = async (): Promise<TodoWithRelations[]> => {
  const response = await axios.get("/api/todos");
  return response.data;
};

export const useFetchTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });
};
