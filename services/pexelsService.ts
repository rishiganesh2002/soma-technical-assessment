import {
  PexelsSearchQuery,
  pexelsClient,
  PexelsImageResult,
} from "../schema/Pexels";

export class PexelsService {
  async search(query: PexelsSearchQuery): Promise<PexelsImageResult | null> {
    try {
      const result = await pexelsClient.searchImageByQuery(query.query);
      return result;
    } catch (error) {
      console.error("Error in PexelsService.search:", error);
      return null;
    }
  }
}
