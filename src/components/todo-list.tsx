"use client";

import type { FilterType, Todo } from "../lib/types";
import { TodoItem } from "./todo-item";

interface TodoListProps {
  todos: Todo[];
  filter: FilterType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const EMPTY_MESSAGES: Record<FilterType, string> = {
  all: "No todos yet — add one above!",
  active: "Nothing left to do. 🎉",
  completed: "No completed todos yet.",
};

export function TodoList({ todos, filter, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-600">
        {EMPTY_MESSAGES[filter]}
      </p>
    );
  }

  return (
    <ul
      aria-label="Todo list"
      className="divide-y divide-neutral-100 dark:divide-neutral-800"
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
