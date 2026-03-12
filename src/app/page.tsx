"use client";

import { TodoFilter } from "../components/todo-filter";
import { TodoInput } from "../components/todo-input";
import { TodoList } from "../components/todo-list";
import { useTodos } from "../lib/use-todos";

export default function Home() {
  const {
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    activeCount,
    completedCount,
  } = useTodos();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-start justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          TODO
        </h1>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-4 flex flex-col gap-4">
          <TodoInput onAdd={addTodo} />
          <TodoList
            todos={filteredTodos}
            filter={filter}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
          <TodoFilter
            activeCount={activeCount}
            completedCount={completedCount}
            filter={filter}
            onFilterChange={setFilter}
            onClearCompleted={clearCompleted}
          />
        </div>
      </div>
    </main>
  );
}
