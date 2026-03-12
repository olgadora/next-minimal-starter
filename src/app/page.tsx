"use client";

import { format, isBefore, isToday, startOfDay } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
}

type TabKey = "all" | "upcoming" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (trimmed === "") return;
    const newTodo: Todo = {
      id: Date.now(),
      text: trimmed,
      completed: false,
    };
    if (selectedDate) {
      newTodo.dueDate = selectedDate.toISOString();
    }
    setTodos((prev) => [...prev, newTodo]);
    setInput("");
    setSelectedDate(undefined);
    setShowCalendar(false);
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

  const today = startOfDay(new Date());

  const filteredTodos = todos.filter((todo) => {
    if (activeTab === "completed") return todo.completed;
    if (activeTab === "upcoming") {
      if (todo.completed) return false;
      if (!todo.dueDate) return false;
      const due = startOfDay(new Date(todo.dueDate));
      return isToday(due) || !isBefore(due, today);
    }
    return true;
  });

  const allCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const upcomingCount = todos.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const due = startOfDay(new Date(t.dueDate));
    return isToday(due) || !isBefore(due, today);
  }).length;

  const isOverdue = (todo: Todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const due = startOfDay(new Date(todo.dueDate));
    return isBefore(due, today) && !isToday(due);
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: allCount },
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "completed", label: "Completed", count: completedCount },
  ];

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
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {/* Calendar toggle */}
            <div className="relative" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className={`rounded-lg border px-3 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  selectedDate
                    ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                    : "border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-600"
                }`}
                aria-label="Pick a due date"
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
              {showCalendar && (
                <div className="absolute right-0 top-full z-10 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date ?? undefined);
                      setShowCalendar(false);
                    }}
                    classNames={{
                      today: "font-bold text-indigo-600",
                      selected:
                        "bg-indigo-600 text-white rounded-full",
                      root: "text-gray-900",
                      chevron: "fill-indigo-600",
                    }}
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
          {/* Selected date badge */}
          {selectedDate && (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Due: {format(selectedDate, "MMM d, yyyy")}
                <button
                  type="button"
                  onClick={() => setSelectedDate(undefined)}
                  className="ml-1 rounded-full p-0.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600"
                  aria-label="Clear due date"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="mb-4 rounded-xl bg-white px-2 shadow-sm">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.key
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Task List Card */}
        <div className="rounded-xl bg-white shadow-sm">
          {filteredTodos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">
                {activeTab === "all" && "No tasks yet. Add one above!"}
                {activeTab === "upcoming" &&
                  "No upcoming tasks with due dates."}
                {activeTab === "completed" && "No completed tasks yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
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
                  {todo.dueDate && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isOverdue(todo)
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isOverdue(todo) ? "Overdue \u00b7 " : ""}
                      {format(new Date(todo.dueDate), "MMM d")}
                    </span>
                  )}

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
