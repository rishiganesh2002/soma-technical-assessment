import { NextResponse } from "next/server";
import { todoService } from "@/services/todoService";
import { TodoIdSchema } from "@/schema/Todos";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const validatedParams = TodoIdSchema.parse(params);
    const id = parseInt(validatedParams.id);

    const todo = await todoService.getTodoById(id);
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error fetching todo" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const validatedParams = TodoIdSchema.parse(params);
    const id = parseInt(validatedParams.id);

    const deletedTodo = await todoService.deleteTodoById(id);
    if (!deletedTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Todo deleted", todo: deletedTodo },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error deleting todo" }, { status: 500 });
  }
}
