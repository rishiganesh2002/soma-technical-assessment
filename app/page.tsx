"use client";
import { Todo } from "@prisma/client";
import { useFetchTodos } from "../clientLib/Todos/useFetchTodos";
import { useDeleteTodo } from "../clientLib/Todos/useDeleteTodo";
import { isPastDueDate } from "../utils/client/pastDueDate";
import CreateTodoForm from "../components/home/CreateTodoForm";

export default function Home() {
  const { data: todos = [], isLoading, error } = useFetchTodos();
  const deleteTodoMutation = useDeleteTodo();

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodoMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-xl">Loading your tasks...</div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">Error loading tasks</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Things To Do
          </h1>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 text-lg mb-2">No tasks yet</div>
              <div className="text-slate-500">
                Create your first task to get started!
              </div>
            </div>
          ) : (
            todos.map((todo: Todo) => {
              const isPastDue = isPastDueDate(todo.dueDate);
              return (
                <div
                  key={todo.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {todo.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isPastDue
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}
                        >
                          {isPastDue ? "Past Due" : "On Track"}
                        </span>
                        <span
                          className={`text-sm ${
                            isPastDue ? "text-red-600" : "text-slate-600"
                          }`}
                        >
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      disabled={deleteTodoMutation.isPending}
                      className="ml-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                      title="Delete task"
                    >
                      <svg
                        className="w-5 h-5"
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <CreateTodoForm />
    </div>
  );
}
