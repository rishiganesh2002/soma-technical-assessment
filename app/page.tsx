"use client";
import type { TodoWithRelations } from "../schema/Todos";
import { useState, useMemo } from "react";
import { useFetchTodos, useDeleteTodo } from "../clientLib/Todos";
import { sortTodosByDate } from "../utils/client";
import {
  CreateTodoForm,
  TodoCard,
  DependencyGraph,
  TodoStats,
} from "../components/home";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [isSorted, setIsSorted] = useState(false);
  const { data: todos = [], isLoading, error } = useFetchTodos();
  const deleteTodoMutation = useDeleteTodo();

  const sortedTodos = useMemo(() => {
    if (!isSorted) return todos;
    return sortTodosByDate(todos);
  }, [todos, isSorted]);

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
          <p className="text-slate-600 text-lg font-medium mb-6">
            Manage your complex workflows with visual inspiration ✨
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="text-base font-medium">
              📋 Tasks
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-base font-medium">
              🕸️ Dependency Graph
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Stats Dashboard */}
            {todos.length > 0 && <TodoStats todos={todos} />}

            {/* Sort Toggle */}
            {todos.length > 0 && (
              <div className="flex justify-start">
                <button
                  onClick={() => setIsSorted(!isSorted)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isSorted
                      ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                  title={
                    isSorted
                      ? "Show original order"
                      : "Sort by due date (earliest first)"
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  {isSorted ? "Original Order" : "Sort by Date"}
                </button>
              </div>
            )}

            {/* Tasks List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedTodos.length === 0 ? (
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
                sortedTodos.map((todo: TodoWithRelations) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onDelete={handleDeleteTodo}
                    isDeleting={deleteTodoMutation.isPending}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Graph Tab */}
          <TabsContent value="graph" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Task Dependencies
              </h2>
              <p className="text-slate-600">
                Visualize how your tasks are connected and identify critical
                paths
              </p>
            </div>
            <DependencyGraph />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <CreateTodoForm />
    </div>
  );
}
