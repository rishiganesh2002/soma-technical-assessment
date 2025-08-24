"use client";
import { useParams, useRouter } from "next/navigation";
import { useGetTodoById } from "../../../clientLib/Todos/useGetTodoById";
import { isPastDueDate } from "../../../utils/client/pastDueDate";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const todoId = Number(params.id);

  const { data: todo, isLoading, error } = useGetTodoById(todoId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Skeleton className="h-80 w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !todo) {
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
              Todo not found
            </h2>
            <p className="text-slate-600 mb-6">
              The todo you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-slate-900 hover:bg-slate-800"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPastDue = isPastDueDate(todo.dueDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Tasks
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {todo.title}
          </h1>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                isPastDue
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isPastDue ? "⚠️ Past Due" : "✅ On Track"}
            </span>
            <span
              className={`text-lg font-medium ${
                isPastDue ? "text-red-600" : "text-slate-600"
              }`}
            >
              Due: {new Date(todo.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Dependencies: {todo.dependencies.length} • Dependents:{" "}
            {todo.dependents.length}
          </div>
        </div>

        {/* Todo Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Image Section */}
            {todo.imageUrl && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Visual Inspiration
                </h3>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
                  <Image
                    src={todo.imageUrl}
                    alt={todo.imageAlt || `Image for ${todo.title}`}
                    width={400}
                    height={300}
                    className="w-full h-80 object-cover"
                  />
                </div>
                {todo.imageAlt && (
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {todo.imageAlt}
                  </p>
                )}
              </div>
            )}

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Task Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Title
                    </label>
                    <p className="text-lg text-slate-900 mt-1">{todo.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Due Date
                    </label>
                    <p className="text-lg text-slate-900 mt-1">
                      {new Date(todo.dueDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                          isPastDue
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isPastDue ? "⚠️ Past Due" : "✅ On Track"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Tasks
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
