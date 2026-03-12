"use client";

import type { FilterType } from "../lib/types";

interface TodoFilterProps {
  activeCount: number;
  completedCount: number;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClearCompleted: () => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function TodoFilter({
  activeCount,
  completedCount,
  filter,
  onFilterChange,
  onClearCompleted,
}: TodoFilterProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <span className="text-xs text-neutral-400 dark:text-neutral-600 shrink-0">
        {activeCount} {activeCount === 1 ? "item" : "items"} left
      </span>

      <nav aria-label="Filter todos" className="flex gap-1">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
            className={`px-3 py-1 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition ${
              filter === value
                ? "bg-violet-500 text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {completedCount > 0 ? (
        <button
          type="button"
          onClick={onClearCompleted}
          className="text-xs text-neutral-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition shrink-0"
        >
          Clear completed
        </button>
      ) : (
        <span className="text-xs shrink-0 invisible">Clear completed</span>
      )}
    </div>
  );
}
