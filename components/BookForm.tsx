"use client";
import { useState } from "react";
import { useBooks } from "@/contexts/BooksContext";
import { validateBook } from "@/lib/bookUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUSES = ["To Read", "Reading", "Finished"] as const;

export default function BookForm() {
  const { addBook } = useBooks();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function revalidateField(name: string, value: string) {
    if (bookSuccess) setBookSuccess(false);
    if (bookError) setBookError("");
    if (!errors[name]) return;
    const all = { title, author, pages, status, [name]: value };
    const newErrs = validateBook(all);
    if (!newErrs[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    } else {
      setErrors((prev) => ({ ...prev, [name]: newErrs[name] }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBookSuccess(false);
    setBookError("");
    const errs = validateBook({ title, author, pages, status });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await addBook({ title, author, pages, status });
    setSubmitting(false);
    if (error) {
      setBookError(error);
      return;
    }
    setTitle("");
    setAuthor("");
    setPages("");
    setStatus("");
    setBookSuccess(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Book</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          data-testid="book-form"
          noValidate
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label htmlFor="input-title">Title</Label>
            <Input
              id="input-title"
              data-testid="input-title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); revalidateField("title", e.target.value); }}
            />
            {errors.title && (
              <p data-testid="error-title" className="text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="input-author">Author</Label>
            <Input
              id="input-author"
              data-testid="input-author"
              type="text"
              value={author}
              onChange={(e) => { setAuthor(e.target.value); revalidateField("author", e.target.value); }}
            />
            {errors.author && (
              <p data-testid="error-author" className="text-sm text-red-600">
                {errors.author}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="input-pages">Pages</Label>
            <Input
              id="input-pages"
              data-testid="input-pages"
              type="text"
              inputMode="numeric"
              value={pages}
              onChange={(e) => { setPages(e.target.value); revalidateField("pages", e.target.value); }}
            />
            {errors.pages && (
              <p data-testid="error-pages" className="text-sm text-red-600">
                {errors.pages}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="select-status">Status</Label>
            <select
              id="select-status"
              data-testid="select-status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); revalidateField("status", e.target.value); }}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.status && (
              <p data-testid="error-status" className="text-sm text-red-600">
                {errors.status}
              </p>
            )}
          </div>

          {bookError && (
            <p data-testid="error-book" className="text-sm text-red-600">
              {bookError}
            </p>
          )}
          {bookSuccess && (
            <p data-testid="book-success" className="text-sm text-green-600">
              Book added
            </p>
          )}

          <Button
            data-testid="btn-add-book"
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Adding…" : "Add Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

