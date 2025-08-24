"use client";
import { Todo } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFetchTodos } from "../clientLib/Todos/useFetchTodos";
import { useDeleteTodo } from "../clientLib/Todos/useDeleteTodo";
import { isPastDueDate } from "../utils/client/pastDueDate";
import CreateTodoForm from "../components/home/CreateTodoForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const router = useRouter();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Section Skeleton */}
          <div className="text-center mb-8">
            <Skeleton className="h-16 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          {/* Tasks List Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-24 w-24 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <Skeleton className="h-5 w-20 rounded-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 mb-6">
              We couldn't load your tasks. Please try refreshing the page or
              check your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-4">
            The Todo App
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            Manage your complex workflows with visual inspiration ✨
          </p>
        </div>

        {/* Tasks List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="text-slate-400 text-xl font-semibold mb-2">
                  No tasks yet
                </div>
                <div className="text-slate-500">
                  Create your first task to get started!
                </div>
              </div>
            </div>
          ) : (
            todos.map((todo: Todo) => {
              const isPastDue = isPastDueDate(todo.dueDate);
              return (
                <div
                  key={todo.id}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-4">
                    {/* Image Thumbnail */}
                    {todo.imageUrl && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                        <Image
                          src={todo.imageUrl}
                          alt={todo.imageAlt || `Image for ${todo.title}`}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Hover Overlay with Alt Text */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <p className="text-white text-sm text-center px-4 leading-relaxed">
                            {todo.imageAlt}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Todo Content */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-900 transition-colors duration-200">
                        {todo.title}
                      </h3>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            isPastDue
                              ? "bg-red-100 text-red-700 border border-red-200 shadow-sm"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                          }`}
                        >
                          {isPastDue ? "⚠️ Past Due" : "✅ On Track"}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isPastDue ? "text-red-600" : "text-slate-600"
                          }`}
                        >
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-end mt-auto">
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        disabled={deleteTodoMutation.isPending}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 group-hover:bg-slate-50"
                        title="Delete task"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => router.push(`/todos/${todo.id}`)}
                        className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:bg-slate-50"
                        title="View task details"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
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
