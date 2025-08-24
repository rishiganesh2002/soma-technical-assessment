import { z } from "zod";
import axios from "axios";

export const PexelsSearchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
});

export type PexelsSearchQuery = z.infer<typeof PexelsSearchQuerySchema>;

// Response types for Pexels API
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export interface PexelsImageResult {
  imageUrl: string;
  imageAlt: string;
}

class PexelsClient {
  private static instance: PexelsClient;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = "https://api.pexels.com/v1";
    this.apiKey = process.env.PEXELS_API_KEY || "";

    if (!this.apiKey) {
      console.warn("PEXELS_API_KEY not found in environment variables");
    }
  }

  public static getInstance(): PexelsClient {
    if (!PexelsClient.instance) {
      PexelsClient.instance = new PexelsClient();
    }
    return PexelsClient.instance;
  }

  async searchImageByQuery(query: string): Promise<PexelsImageResult | null> {
    try {
      if (!this.apiKey) {
        throw new Error("Pexels API key not configured");
      }

      const response = await axios.get<PexelsSearchResponse>(
        `${this.baseUrl}/search`,
        {
          headers: {
            Authorization: this.apiKey,
          },
          params: {
            query,
            per_page: 1,
          },
        }
      );

      const photos = response.data.photos;
      if (photos.length === 0) {
        return null;
      }

      const photo = photos[0];
      return {
        imageUrl: photo.src.medium,
        imageAlt: photo.alt || `Image related to ${query}`,
      };
    } catch (error) {
      console.error("Error searching Pexels:", error);
      return null;
    }
  }
}

// Export the singleton instance
export const pexelsClient = PexelsClient.getInstance();
