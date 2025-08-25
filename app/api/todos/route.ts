import { NextResponse } from "next/server";
import { todoService } from "@/services/todoService";
import { TodoSchema } from "@/schema/Todos";

export async function GET() {
  try {
    const todos = await todoService.getTodos();
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = TodoSchema.parse(body);

    const todo = await todoService.createTodo(validatedData);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error creating todo" }, { status: 500 });
  }
}
