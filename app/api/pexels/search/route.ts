import { NextRequest, NextResponse } from "next/server";
import { PexelsSearchQuerySchema } from "@/schema/Pexels";
import { PexelsService } from "@/services/pexelsService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    // Validate query parameter
    const validationResult = PexelsSearchQuerySchema.safeParse({ query });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameter",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { query: validatedQuery } = validationResult.data;

    // Use PexelsService to search for images
    const pexelsService = new PexelsService();
    const result = await pexelsService.search({ query: validatedQuery });

    if (!result) {
      return NextResponse.json(
        { error: "No images found for the given query" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      query: validatedQuery,
      image: result,
    });
  } catch (error) {
    console.error("Error in Pexels search route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
