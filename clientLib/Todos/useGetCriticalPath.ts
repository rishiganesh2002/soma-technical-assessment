import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { CriticalPathResult } from "../../utils/server/calculateCriticalPath";

const getCriticalPath = async (): Promise<CriticalPathResult> => {
  const response = await axios.get("/api/todos/critical_path");
  return response.data;
};

export const useGetCriticalPath = () => {
  return useQuery({
    queryKey: ["criticalPath"],
    queryFn: getCriticalPath,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
