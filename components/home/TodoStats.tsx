"use client";

import { useMemo } from "react";
import type { TodoWithRelations } from "../../schema/Todos";

interface TodoStatsProps {
  todos: TodoWithRelations[];
}

export default function TodoStats({ todos }: TodoStatsProps) {
  const stats = useMemo(() => {
    const total = todos.length;
    const pending = todos.filter((todo) => todo.status === "pending").length;
    const inProgress = todos.filter(
      (todo) => todo.status === "inProgress"
    ).length;
    const completed = todos.filter(
      (todo) => todo.status === "completed"
    ).length;

    return { total, pending, inProgress, completed };
  }, [todos]);

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: "📋",
      color: "bg-gradient-to-br from-slate-100 to-slate-200",
      textColor: "text-slate-700",
      borderColor: "border-slate-300",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: "⏳",
      color: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-300",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: "🔄",
      color: "bg-gradient-to-br from-blue-100 to-blue-200",
      textColor: "text-blue-700",
      borderColor: "border-blue-300",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: "✅",
      color: "bg-gradient-to-br from-green-100 to-green-200",
      textColor: "text-green-700",
      borderColor: "border-green-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} ${stat.borderColor} border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
