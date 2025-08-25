"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateTodo } from "@/clientLib/Todos/useCreateTodo";
import { useSearchImageByQuery } from "@/clientLib/Pexels/useSearchImageByQuery";
import { useFetchTodos } from "@/clientLib/Todos/useFetchTodos";
import { CreateTodoInput } from "@/schema/Todos";
import { Plus, Calendar, Image as ImageIcon, X } from "lucide-react";
import debounce from "lodash.debounce";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CreateTodoForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: "",
    dueDate: new Date().toISOString(),
    imageUrl: undefined,
    imageAlt: undefined,
    estimatedCompletionDays: 1,
  });
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [selectedDependencies, setSelectedDependencies] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [dependenciesOpen, setDependenciesOpen] = useState(false);

  const createTodoMutation = useCreateTodo();
  const { data: availableTodos = [], isLoading: isTodosLoading } =
    useFetchTodos();

  // Debounced function to update the search query
  const debouncedSearch = useCallback(
    debounce((title: string) => {
      setDebouncedTitle(title);
    }, 500),
    []
  );

  // Update debounced title when form title changes
  useEffect(() => {
    if (formData.title.trim()) {
      debouncedSearch(formData.title.trim());
    } else {
      setDebouncedTitle("");
    }
  }, [formData.title, debouncedSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Use the Pexels hook with debounced title
  const { data: imageResult, isLoading: isImageLoading } =
    useSearchImageByQuery(debouncedTitle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.dueDate) return;

    try {
      const todoData = {
        ...formData,
        imageUrl: imageResult?.imageUrl,
        imageAlt: imageResult?.imageAlt,
        dependencies: selectedDependencies.map((todo) => todo.id),
      };

      await createTodoMutation.mutateAsync(todoData);
      setFormData({
        title: "",
        dueDate: new Date().toISOString(),
        imageUrl: undefined,
        imageAlt: undefined,
        estimatedCompletionDays: 1,
      });
      setDebouncedTitle("");
      setSelectedDependencies([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const handleDateChange = (dateValue: string) => {
    const isoDate = new Date(dateValue + "T00:00:00.000Z").toISOString();
    setFormData((prev) => ({
      ...prev,
      dueDate: isoDate,
    }));
  };

  const toggleDependency = (todo: { id: number; title: string }) => {
    setSelectedDependencies((prev) =>
      prev.some((dep) => dep.id === todo.id)
        ? prev.filter((dep) => dep.id !== todo.id)
        : [...prev, todo]
    );
  };

  const removeDependency = (todoId: number) => {
    setSelectedDependencies((prev) => prev.filter((dep) => dep.id !== todoId));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-4 h-14 w-14 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white max-h-screen overflow-hidden flex flex-col">
        <SheetHeader className="space-y-4 flex-shrink-0">
          <SheetTitle className="text-2xl font-semibold text-gray-900">
            Create New Task
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Add a new task to your list with a title and due date.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 mt-8 flex-1 overflow-y-auto pr-2"
        >
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Task Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>

          {/* Dependencies Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Dependencies (Optional)
            </Label>
            <Popover open={dependenciesOpen} onOpenChange={setDependenciesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={dependenciesOpen}
                  className="w-full justify-between border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                >
                  {selectedDependencies.length === 0
                    ? "Select parent tasks..."
                    : `${selectedDependencies.length} task${
                        selectedDependencies.length === 1 ? "" : "s"
                      } selected`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search tasks..." />
                  <CommandList>
                    <CommandEmpty>No tasks found.</CommandEmpty>
                    <CommandGroup>
                      {isTodosLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Loading tasks...
                        </div>
                      ) : (
                        availableTodos.map((todo) => (
                          <CommandItem
                            key={todo.id}
                            onSelect={() => toggleDependency(todo)}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedDependencies.some(
                                  (dep) => dep.id === todo.id
                                )}
                                onChange={() => {}}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{todo.title}</span>
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Dependencies Display */}
            {selectedDependencies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDependencies.map((todo, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {todo.title}
                    <button
                      type="button"
                      onClick={() => removeDependency(todo.id)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Estimated Completion Days Section */}
          <div className="space-y-2">
            <Label
              htmlFor="estimatedCompletionDays"
              className="text-sm font-medium text-gray-700"
            >
              Estimated Completion Days
            </Label>
            <Input
              id="estimatedCompletionDays"
              type="number"
              min="1"
              placeholder="1"
              value={formData.estimatedCompletionDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedCompletionDays: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>

          {/* Image Preview Section */}
          {debouncedTitle && debouncedTitle.trim().length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Task Preview
              </Label>

              {isImageLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : imageResult ? (
                <div className="space-y-2">
                  <Image
                    src={imageResult.imageUrl}
                    alt={imageResult.imageAlt}
                    width={300}
                    height={240}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-600 italic">
                    {imageResult.imageAlt}
                  </p>
                </div>
              ) : debouncedTitle.length > 2 ? (
                <div className="text-sm text-gray-500 italic">
                  No relevant image found for "{debouncedTitle}"
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="dueDate"
              className="text-sm font-medium text-gray-700"
            >
              Due Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="dueDate"
                type="date"
                value={new Date(formData.dueDate).toISOString().split("T")[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                required
              />
            </div>
          </div>
        </form>

        {/* Fixed Button Section */}
        <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createTodoMutation.isPending ||
              !formData.title.trim() ||
              isImageLoading
            }
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {createTodoMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
