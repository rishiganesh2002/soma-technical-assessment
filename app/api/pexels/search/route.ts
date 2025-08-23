import { NextRequest, NextResponse } from "next/server";
import { PexelsSearchQuerySchema } from "@/schema/Pexels";

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

    // Placeholder content for now
    return NextResponse.json({
      message: "Pexels search endpoint",
      query: validatedQuery,
      status: "stub - implementation pending",
    });
  } catch (error) {
    console.error("Error in Pexels search route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
