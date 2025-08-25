import { NextRequest, NextResponse } from "next/server";
import {
  AddDependenciesSchema,
  DeleteDependenciesSchema,
  TodoIdParamsSchema,
} from "../../../../../schema/TodoDependencies";
import { TodoService } from "../../../../../services/todoService";

// POST /api/todos/[id]/dependencies - Add dependencies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate todo ID from route params
    const todoIdValidation = TodoIdParamsSchema.safeParse({ id });
    if (!todoIdValidation.success) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    const todoId = parseInt(id);

    // Validate request body
    const body = await request.json();
    const validation = AddDependenciesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { dependencies } = validation.data;

    // Use the TodoService to add dependencies
    const todoService = new TodoService();
    const result = await todoService.addDependenciesToTodo(
      todoId,
      dependencies
    );

    return NextResponse.json(
      {
        message: "Processed dependencies",
        todoId,
        requested: dependencies,
        successful: result.successfulDependencies,
        errors: result.errors,
      },
      { status: 200 }
    );
  } catch (error) {
    // Keep server logs concise
    console.warn("Error adding dependencies");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id]/dependencies?dependencyIds=1,2,3 - Remove dependencies
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate todo ID from route params
    const todoIdValidation = TodoIdParamsSchema.safeParse({ id });
    if (!todoIdValidation.success) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    const todoId = parseInt(id);

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const dependencyIdsParam = searchParams.get("dependencyIds");

    if (!dependencyIdsParam) {
      return NextResponse.json(
        { error: "dependencyIds query parameter is required" },
        { status: 400 }
      );
    }

    const validation = DeleteDependenciesSchema.safeParse({
      dependencyIds: dependencyIdsParam,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid dependencyIds format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Parse comma-separated string to array of numbers
    const dependencyIds = dependencyIdsParam
      .split(",")
      .map((id) => parseInt(id));

    // Use the TodoService to delete dependencies
    const todoService = new TodoService();
    const result = await todoService.deleteDependenciesFromTodo(dependencyIds);

    return NextResponse.json(
      {
        message: "Processed dependency deletion",
        todoId,
        requested: dependencyIds,
        successful: result.successfulDependencies,
        errors: result.errors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing dependencies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
