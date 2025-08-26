import { NextRequest, NextResponse } from "next/server";
import { todoService } from "../../../../services/todoService";

export async function GET(request: NextRequest) {
  try {
    const criticalPathResult = await todoService.calculateCriticalPath();

    return NextResponse.json(criticalPathResult);
  } catch (error) {
    console.error("Error calculating critical path:", error);
    return NextResponse.json(
      { error: "Failed to calculate critical path" },
      { status: 500 }
    );
  }
}
