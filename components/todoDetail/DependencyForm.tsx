"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useFetchTodos } from "../../clientLib/Todos/useFetchTodos";
import { useAddDependencies } from "../../clientLib/TodoDependencies/useAddDependencies";
import { useDeleteDependencies } from "../../clientLib/TodoDependencies/useDeleteDependencies";
import type { AddDependenciesResult } from "../../clientLib/TodoDependencies/useAddDependencies";
import type { DeleteDependenciesResult } from "../../clientLib/TodoDependencies/useDeleteDependencies";
import type { TodoWithRelations } from "../../schema/Todos";

interface DependencyFormProps {
  currentTodo: TodoWithRelations;
}

export function DependencyForm({ currentTodo }: DependencyFormProps) {
  const [newDependencies, setNewDependencies] = useState<number[]>([]);
  const [dependenciesToDelete, setDependenciesToDelete] = useState<number[]>(
    []
  );
  const [isOpen, setIsOpen] = useState(false);
  const [addResult, setAddResult] = useState<AddDependenciesResult | null>(
    null
  );
  const [deleteResult, setDeleteResult] =
    useState<DeleteDependenciesResult | null>(null);

  const { data: allTodos, isLoading } = useFetchTodos();
  const addDependenciesMutation = useAddDependencies();
  const deleteDependenciesMutation = useDeleteDependencies();

  // Filter out the current todo, any immediate children (dependents), and existing dependencies
  const availableTodos =
    allTodos?.filter((todo) => {
      // Don't include the current todo
      if (todo.id === currentTodo.id) return false;

      // Don't include any todos that are immediate children (dependents)
      const isImmediateChild = currentTodo.dependents.some(
        (dep) => dep.childTodo === todo.id
      );
      if (isImmediateChild) return false;

      // Don't include any todos that are already direct dependencies
      const isAlreadyDependency = currentTodo.dependencies.some(
        (dep) => dep.parentTodo === todo.id
      );
      if (isAlreadyDependency) return false;

      return true;
    }) || [];

  const handleDependencyToggle = (todoId: number, checked: boolean) => {
    if (checked) {
      setNewDependencies((prev) => [...prev, todoId]);
    } else {
      setNewDependencies((prev) => prev.filter((id) => id !== todoId));
    }
  };

  const handleDeleteDependencyToggle = (
    dependencyId: number,
    checked: boolean
  ) => {
    if (checked) {
      setDependenciesToDelete((prev) => [...prev, dependencyId]);
    } else {
      setDependenciesToDelete((prev) =>
        prev.filter((id) => id !== dependencyId)
      );
    }
  };

  const handleSubmit = async () => {
    if (newDependencies.length === 0) return;

    try {
      const response = await addDependenciesMutation.mutateAsync({
        dependencies: newDependencies,
        childTodoId: currentTodo.id,
      });
      setAddResult(response);

      if (response.errors.length === 0) {
        // All good — close and reset
        setIsOpen(false);
        setNewDependencies([]);
      } else {
        // Partial failure — keep open, remove successful from selection
        const failedIds = new Set(response.errors.map((e) => e.dependencyId));
        const remaining = newDependencies.filter((id) => failedIds.has(id));
        setNewDependencies(remaining);
      }
    } catch (error) {
      // Keep the sheet open and show a generic error banner
      setAddResult({
        message: "Request failed",
        todoId: currentTodo.id,
        requested: newDependencies,
        successful: [],
        errors: newDependencies.map((id) => ({
          dependencyId: id,
          reason: "Request failed. Please try again.",
        })),
      });
    }
  };

  const handleDeleteSubmit = async () => {
    if (dependenciesToDelete.length === 0) return;

    try {
      const response = await deleteDependenciesMutation.mutateAsync({
        dependencyIds: dependenciesToDelete,
        childTodoId: currentTodo.id,
      });
      setDeleteResult(response);

      if (response.errors.length === 0) {
        // All good — reset selection
        setDependenciesToDelete([]);
      } else {
        // Partial failure — remove successful from selection
        const failedIds = new Set(response.errors.map((e) => e.dependencyId));
        const remaining = dependenciesToDelete.filter((id) =>
          failedIds.has(id)
        );
        setDependenciesToDelete(remaining);
      }
    } catch (error) {
      // Show a generic error banner
      setDeleteResult({
        message: "Request failed",
        todoId: currentTodo.id,
        requested: dependenciesToDelete,
        successful: [],
        errors: dependenciesToDelete.map((id) => ({
          dependencyId: id,
          reason: "Request failed. Please try again.",
        })),
      });
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setNewDependencies([]);
    setDependenciesToDelete([]);
    setAddResult(null);
    setDeleteResult(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          Manage Dependencies
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Manage Dependencies</SheetTitle>
          <SheetDescription>
            Add new dependencies or remove existing ones for "
            {currentTodo.title}".
          </SheetDescription>
        </SheetHeader>

        {/* Add Dependencies Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-slate-900 mb-3">
            Add Dependencies
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Select parent tasks that must be completed before this task can be
            started.
          </p>

          {addResult && (
            <div className="mb-4 space-y-2">
              {addResult.successful.length > 0 && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
                  Added: {addResult.successful.length} dependencies
                </div>
              )}
              {addResult.errors.length > 0 && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                  <div className="font-medium">Failed to add:</div>
                  <ul className="mt-1 list-disc list-inside">
                    {addResult.errors.map((e) => (
                      <li key={e.dependencyId}>
                        <span className="font-mono">{e.dependencyId}</span>:{" "}
                        {e.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-2">
                  Loading available tasks...
                </p>
              </div>
            ) : availableTodos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-600">
                  No available tasks to add as dependencies.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {availableTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      id={`todo-${todo.id}`}
                      checked={newDependencies.includes(todo.id)}
                      onChange={(e) =>
                        handleDependencyToggle(todo.id, e.target.checked)
                      }
                      className="h-4 w-4 text-slate-900 focus:ring-slate-500 border-slate-300 rounded"
                    />
                    <Label
                      htmlFor={`todo-${todo.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-slate-900">
                        {todo.title}
                      </div>
                      <div className="text-sm text-slate-500">
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button
              onClick={handleSubmit}
              disabled={
                newDependencies.length === 0 ||
                addDependenciesMutation.isPending
              }
              className="w-full"
            >
              {addDependenciesMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                `Add Dependencies (${newDependencies.length})`
              )}
            </Button>
          </div>
        </div>

        {/* Delete Dependencies Section */}
        {currentTodo.dependencies.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              Remove Dependencies
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Select existing dependencies to remove from this task.
            </p>

            {deleteResult && (
              <div className="mb-4 space-y-2">
                {deleteResult.successful.length > 0 && (
                  <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
                    Removed: {deleteResult.successful.length} dependencies
                  </div>
                )}
                {deleteResult.errors.length > 0 && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                    <div className="font-medium">Failed to remove:</div>
                    <ul className="mt-1 list-disc list-inside">
                      {deleteResult.errors.map((e) => (
                        <li key={e.dependencyId}>
                          <span className="font-mono">{e.dependencyId}</span>:{" "}
                          {e.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {currentTodo.dependencies.map((dependency) => {
                const parentTodo = allTodos?.find(
                  (todo) => todo.id === dependency.parentTodo
                );
                return (
                  <div
                    key={dependency.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      id={`delete-${dependency.id}`}
                      checked={dependenciesToDelete.includes(dependency.id)}
                      onChange={(e) =>
                        handleDeleteDependencyToggle(
                          dependency.id,
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
                    />
                    <Label
                      htmlFor={`delete-${dependency.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-slate-900">
                        {parentTodo?.title || `Task ${dependency.parentTodo}`}
                      </div>
                      <div className="text-sm text-slate-500">
                        Dependency ID: {dependency.id}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <Button
                onClick={handleDeleteSubmit}
                disabled={
                  dependenciesToDelete.length === 0 ||
                  deleteDependenciesMutation.isPending
                }
                variant="destructive"
                className="w-full"
              >
                {deleteDependenciesMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removing...
                  </>
                ) : (
                  `Remove Dependencies (${dependenciesToDelete.length})`
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={
              addDependenciesMutation.isPending ||
              deleteDependenciesMutation.isPending
            }
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
