"use client";

import { useState } from "react";
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
import { useCreateTodo } from "@/clientLib/Todos/useCreateTodo";
import { CreateTodoInput } from "@/schema/Todos";
import { Plus, Calendar } from "lucide-react";

export default function CreateTodoForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: "",
    dueDate: new Date().toISOString(),
  });

  const createTodoMutation = useCreateTodo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.dueDate) return;

    try {
      await createTodoMutation.mutateAsync(formData);
      setFormData({
        title: "",
        dueDate: new Date().toISOString(),
      });
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
      <SheetContent className="w-[400px] sm:w-[540px] bg-white">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-2xl font-semibold text-gray-900">
            Create New Task
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Add a new task to your list with a title and due date.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
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

          <div className="flex gap-3 pt-4">
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
              disabled={createTodoMutation.isPending || !formData.title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {createTodoMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
