import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Todo } from "@prisma/client";

const fetchTodos = async (): Promise<Todo[]> => {
  const response = await axios.get("/api/todos");
  return response.data;
};

export const useFetchTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });
};
