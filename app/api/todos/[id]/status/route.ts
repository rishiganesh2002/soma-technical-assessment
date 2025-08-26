import { NextRequest, NextResponse } from "next/server";
import { todoService } from "../../../../../services/todoService";
import {
  UpdateTodoStatusSchema,
  TodoIdSchema,
} from "../../../../../schema/Todos";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate the ID parameter
    const idValidation = TodoIdSchema.safeParse({ id: params.id });
    if (!idValidation.success) {
      return NextResponse.json({ error: "Invalid todo ID" }, { status: 400 });
    }

    const todoId = parseInt(params.id);

    // Parse and validate the request body
    const body = await request.json();
    const statusValidation = UpdateTodoStatusSchema.safeParse(body);

    if (!statusValidation.success) {
      return NextResponse.json(
        { error: "Invalid status value", details: statusValidation.error },
        { status: 400 }
      );
    }

    const { status } = statusValidation.data;

    // Update the todo status
    const updatedTodo = await todoService.updateTodoStatus(todoId, status);

    if (!updatedTodo) {
      return NextResponse.json(
        { error: "Todo not found or could not be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.error("Error updating todo status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
