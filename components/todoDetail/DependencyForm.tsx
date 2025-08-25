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
import type { AddDependenciesResult } from "../../clientLib/TodoDependencies/useAddDependencies";
import type { TodoWithRelations } from "../../schema/Todos";

interface DependencyFormProps {
  currentTodo: TodoWithRelations;
}

export function DependencyForm({ currentTodo }: DependencyFormProps) {
  const [newDependencies, setNewDependencies] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<AddDependenciesResult | null>(null);

  const { data: allTodos, isLoading } = useFetchTodos();
  const addDependenciesMutation = useAddDependencies();

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

  const handleSubmit = async () => {
    if (newDependencies.length === 0) return;

    try {
      const response = await addDependenciesMutation.mutateAsync({
        dependencies: newDependencies,
        childTodoId: currentTodo.id,
      });
      setResult(response);

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
      setResult({
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

  const handleCancel = () => {
    setIsOpen(false);
    setNewDependencies([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          Add Dependencies
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Dependencies</SheetTitle>
          <SheetDescription>
            Select parent tasks that must be completed before "
            {currentTodo.title}" can be started.
          </SheetDescription>
        </SheetHeader>

        {result && (
          <div className="mt-4 space-y-2">
            {result.successful.length > 0 && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
                Added: {result.successful.length} dependencies
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                <div className="font-medium">Failed to add:</div>
                <ul className="mt-1 list-disc list-inside">
                  {result.errors.map((e) => (
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

        <div className="mt-6 space-y-4">
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
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

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={
              newDependencies.length === 0 || addDependenciesMutation.isPending
            }
            className="flex-1"
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
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={addDependenciesMutation.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
