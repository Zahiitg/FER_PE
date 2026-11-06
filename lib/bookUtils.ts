export const STATUSES = ["To Read", "Reading", "Finished"] as const;
export type Status = (typeof STATUSES)[number];

export const NEXT_STATUS: Record<string, Status | undefined> = {
  "To Read": "Reading",
  "Reading": "Finished",
};

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  pages: number;
  status: Status;
  created_at: string;
}

export function validateBook(v: {
  title: string;
  author: string;
  pages: string;
  status: string;
}) {
  const e: Record<string, string> = {};
  const title = v.title.trim();
  const author = v.author.trim();
  const pages = v.pages.trim();

  if (!title) e.title = "Title is required";
  else if (Array.from(title).length > 80) e.title = "Title must be at most 80 characters";

  if (!author) e.author = "Author is required";
  else if (Array.from(author).length > 60) e.author = "Author must be at most 60 characters";

  if (!pages) e.pages = "Pages is required";
  else if (!/^\d+$/.test(pages) || Number(pages) < 1 || Number(pages) > 5000)
    e.pages = "Pages must be a whole number between 1 and 5000";

  if (!v.status) e.status = "Please choose a status";

  return e;
}

export function matchesFilters(
  book: Book,
  statusFilter: string,
  search: string
): boolean {
  const q = search.trim().toLowerCase();
  const matchesStatus = !statusFilter || book.status === statusFilter;
  const matchesSearch =
    !q ||
    book.title.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q);
  return matchesStatus && matchesSearch;
}

export function summarize(list: Book[]) {
  const counts = new Map<string, number>();
  let totalPages = 0;
  for (const b of list) {
    totalPages += b.pages;
    counts.set(b.status, (counts.get(b.status) ?? 0) + 1);
  }
  const breakdown = STATUSES.map((name) => ({ name, count: counts.get(name) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort(
      (a, b) =>
        b.count - a.count || STATUSES.indexOf(a.name) - STATUSES.indexOf(b.name)
    );
  return { count: list.length, totalPages, breakdown };
}

