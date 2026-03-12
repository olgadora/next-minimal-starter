"use client";

import { format, isBefore, isToday, startOfDay } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: Date;
}

type Tab = "all" | "upcoming" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTodo = () => {
    const trimmed = input.trim();
    if (trimmed === "") return;
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        completed: false,
        ...(dueDate !== undefined ? { dueDate } : {}),
      },
    ]);
    setInput("");
    setDueDate(undefined);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  // Tab counts
  const allCount = todos.length;
  const upcomingCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  // Tab filtering
  const filteredTodos = todos.filter((todo) => {
    if (activeTab === "completed") return todo.completed;
    if (activeTab === "upcoming") return !todo.completed;
    return true;
  });

  // Sort upcoming: tasks with due dates first (nearest first), then without
  const sortedTodos =
    activeTab === "upcoming"
      ? [...filteredTodos].sort((a, b) => {
          if (a.dueDate && b.dueDate)
            return a.dueDate.getTime() - b.dueDate.getTime();
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return 0;
        })
      : filteredTodos;

  // Due date badge for each task
  const getDueDateBadge = (todo: Todo) => {
    if (!todo.dueDate) return null;
    const todayStart = startOfDay(new Date());
    const dueStart = startOfDay(todo.dueDate);

    let label: string;
    let badgeClass: string;

    if (isToday(todo.dueDate)) {
      label = "Today";
      badgeClass = todo.completed
        ? "bg-gray-100 text-gray-400"
        : "bg-amber-50 text-amber-600";
    } else if (isBefore(dueStart, todayStart)) {
      label = format(todo.dueDate, "MMM d");
      badgeClass = todo.completed
        ? "bg-gray-100 text-gray-400"
        : "bg-red-50 text-red-600";
    } else {
      label = format(todo.dueDate, "MMM d");
      badgeClass = todo.completed
        ? "bg-gray-100 text-gray-400"
        : "bg-gray-100 text-gray-500";
    }

    return (
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  const emptyMessages: Record<Tab, string> = {
    all: "No tasks yet. Add one above!",
    upcoming: "No upcoming tasks. Add one above!",
    completed: "No completed tasks yet.",
  };

  const tabLabels: Record<Tab, string> = {
    all: "All",
    upcoming: "Upcoming",
    completed: "Completed",
  };

  const tabCounts: Record<Tab, number> = {
    all: allCount,
    upcoming: upcomingCount,
    completed: completedCount,
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          {todos.length > 0 && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              {completedCount}/{todos.length} done
            </span>
          )}
        </div>

        {/* Input Card */}
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />

            {/* Calendar icon button + popover */}
            <div className="relative" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setShowCalendar((v) => !v)}
                className={`flex h-full items-center justify-center rounded-lg border px-3 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  dueDate
                    ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                    : "border-gray-200 bg-gray-50 text-gray-400 hover:border-indigo-300 hover:text-indigo-500"
                }`}
                aria-label="Pick due date"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {/* Calendar popover */}
              {showCalendar && (
                <div className="absolute right-0 top-full z-50 mt-2 rounded-xl bg-white p-3 shadow-lg ring-1 ring-gray-100">
                  <DayPicker
                    mode="single"
                    selected={dueDate}
                    onSelect={(selected) => {
                      setDueDate(selected);
                      if (selected) setShowCalendar(false);
                    }}
                    disabled={{ before: startOfDay(new Date()) }}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addTodo}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>

          {/* Selected due date label */}
          {dueDate && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Due:</span>
              <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                {isToday(dueDate) ? "Today" : format(dueDate, "MMM d, yyyy")}
                <button
                  type="button"
                  onClick={() => setDueDate(undefined)}
                  className="ml-0.5 text-indigo-400 transition-colors hover:text-indigo-700"
                  aria-label="Clear due date"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {(["all", "upcoming", "completed"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tabLabels[tab]}
              {tabCounts[tab] > 0 && (
                <span
                  className={`ml-1.5 text-xs ${
                    activeTab === tab ? "text-indigo-200" : "text-gray-400"
                  }`}
                >
                  ({tabCounts[tab]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task List Card */}
        <div className="rounded-xl bg-white shadow-sm">
          {sortedTodos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">{emptyMessages[activeTab]}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sortedTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      todo.completed
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-gray-300 bg-white hover:border-indigo-400"
                    }`}
                    aria-label={
                      todo.completed
                        ? `Mark "${todo.text}" as incomplete`
                        : `Mark "${todo.text}" as complete`
                    }
                  >
                    {todo.completed && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Task Text */}
                  <span
                    className={`flex-1 text-sm transition-colors ${
                      todo.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.text}
                  </span>

                  {/* Due Date Badge */}
                  {getDueDateBadge(todo)}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    aria-label={`Delete "${todo.text}"`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
