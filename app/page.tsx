"use client";
import { Todo } from "@prisma/client";
import { useState } from "react";
import { useFetchTodos } from "../clientLib/Todos/useFetchTodos";
import { useCreateTodo } from "../clientLib/Todos/useCreateTodo";
import { useDeleteTodo } from "../clientLib/Todos/useDeleteTodo";
import { CreateTodoInput } from "../schema/Todos";
import { isPastDueDate } from "../utils/client/pastDueDate";

export default function Home() {
  const [newTodo, setNewTodo] = useState<CreateTodoInput>({
    title: "",
    dueDate: new Date().toISOString(),
  });

  const { data: todos = [], isLoading, error } = useFetchTodos();
  const createTodoMutation = useCreateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const handleAddTodo = async () => {
    if (!newTodo.title.trim() || !newTodo.dueDate) return;

    try {
      await createTodoMutation.mutateAsync(newTodo);
      setNewTodo({
        title: "",
        dueDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodoMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex items-center justify-center text-white text-xl">
        Error loading todos
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Things To Do App
        </h1>
        <div className="flex mb-6 gap-2">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-lg focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo.title}
            onChange={(e) =>
              setNewTodo((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <input
            type="date"
            className="p-3 focus:outline-none text-gray-700"
            value={new Date(newTodo.dueDate).toISOString().split("T")[0]}
            onChange={(e) =>
              setNewTodo((prev) => ({
                ...prev,
                dueDate: new Date(
                  e.target.value + "T00:00:00.000Z"
                ).toISOString(),
              }))
            }
          />
          <button
            onClick={handleAddTodo}
            disabled={createTodoMutation.isPending}
            className="bg-white text-indigo-600 p-3 rounded-r-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
          >
            {createTodoMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
        <ul>
          {todos.map((todo: Todo) => {
            const isPastDue = isPastDueDate(todo.dueDate);
            return (
              <li
                key={todo.id}
                className="flex justify-between items-center bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg"
              >
                <div className="flex-1">
                  <span className="text-gray-800 block">{todo.title}</span>
                  <span
                    className={`text-sm font-medium ${
                      isPastDue ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                    {isPastDue && (
                      <span className="ml-2 text-xs">(Past Due)</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={deleteTodoMutation.isPending}
                  className="text-red-500 hover:text-red-700 transition duration-300 disabled:opacity-50 ml-4"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
