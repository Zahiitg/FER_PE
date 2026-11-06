"use client";
import { useState } from "react";
import { useBooks } from "@/contexts/BooksContext";
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/bookUtils";

export default function BookList() {
  const { visible, loaded, pendingIds, advanceStatus, deleteBook } = useBooks();
  const [listError, setListError] = useState("");

  async function handleAdvance(book: Book) {
    setListError("");
    const { error } = await advanceStatus(book.id);
    if (error) setListError(error);
  }

  async function handleDelete(id: string) {
    setListError("");
    const { error } = await deleteBook(id);
    if (error) setListError(error);
  }

  if (!loaded) return null;

  return (
    <div>
      {listError && (
        <p className="text-sm text-red-600 mb-3">
          {listError}
        </p>
      )}

      {visible.length === 0 ? (
        <p data-testid="books-empty" className="text-gray-500 text-center py-8">
          No books found
        </p>
      ) : (
        <ul data-testid="book-list" className="space-y-3">
          {visible.map((book) => {
            const pending = pendingIds.has(book.id);
            return (
              <li
                key={book.id}
                data-testid="book-item"
                className="border rounded-lg p-4 bg-white flex flex-col gap-2 min-w-0"
              >
                <div className="min-w-0">
                  <p
                    data-testid="book-title"
                    className="font-semibold text-gray-900 break-words"
                  >
                    {book.title}
                  </p>
                  <p data-testid="book-author" className="text-sm text-gray-600 break-words">
                    {book.author}
                  </p>
                  <p data-testid="book-pages" className="text-sm text-gray-500">
                    {book.pages} pages
                  </p>
                  <span
                    data-testid="book-status"
                    className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 mt-1"
                  >
                    {book.status}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {book.status !== "Finished" && (
                    <Button
                      data-testid="btn-advance-status"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => handleAdvance(book)}
                    >
                      {book.status === "To Read" ? "Start Reading" : "Mark Finished"}
                    </Button>
                  )}
                  <Button
                    data-testid="btn-delete-book"
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

