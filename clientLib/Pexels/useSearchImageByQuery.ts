import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PexelsImageResult } from "@/schema/Pexels";

const searchImageByQuery = async (
  query: string
): Promise<PexelsImageResult> => {
  const response = await axios.get(
    `/api/pexels/search?query=${encodeURIComponent(query)}`
  );
  return response.data.image;
};

export const useSearchImageByQuery = (query: string) => {
  return useQuery({
    queryKey: ["pexels-search", query],
    queryFn: () => searchImageByQuery(query),
    enabled: !!query && query.trim().length > 0, // Only enable for non-empty, non-whitespace queries
    staleTime: 5 * 60 * 1000,
  });
};
