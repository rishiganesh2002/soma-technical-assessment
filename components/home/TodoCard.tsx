"use client";

import type { TodoWithRelations } from "../../schema/Todos";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isPastDueDate } from "../../utils/client";

interface TodoCardProps {
  todo: TodoWithRelations;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export default function TodoCard({
  todo,
  onDelete,
  isDeleting,
}: TodoCardProps) {
  const router = useRouter();
  const isPastDue = isPastDueDate(todo.dueDate);

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
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
            onClick={() => onDelete(todo.id)}
            disabled={isDeleting}
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
}
