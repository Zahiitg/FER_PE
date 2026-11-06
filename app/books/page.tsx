"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BookForm from "@/components/BookForm";
import BookList from "@/components/BookList";
import Filters from "@/components/Filters";
import Summary from "@/components/Summary";

export default function BooksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div data-testid="books-page" className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Books</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left column: form + summary */}
        <div className="space-y-6">
          <BookForm />
          <Summary />
        </div>

        {/* Right column: filters + list */}
        <div>
          <Filters />
          <BookList />
        </div>
      </div>
    </div>
  );
}

