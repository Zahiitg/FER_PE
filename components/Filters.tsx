"use client";
import { useBooks } from "@/contexts/BooksContext";
import { Button } from "@/components/ui/button";

const STATUSES = ["To Read", "Reading", "Finished"] as const;

export default function Filters() {
  const { statusFilter, search, setStatusFilter, setSearch, clearFilters } = useBooks();

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      <select
        data-testid="filter-status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <input
        data-testid="search-input"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title or author…"
        className="border border-input rounded-md px-3 py-2 text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <Button
        data-testid="btn-clear-filters"
        variant="outline"
        size="sm"
        onClick={clearFilters}
      >
        Clear
      </Button>
    </div>
  );
}

