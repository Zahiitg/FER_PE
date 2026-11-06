"use client";
import { useBooks } from "@/contexts/BooksContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Summary() {
  const { summary } = useBooks();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Books shown</span>
          <span data-testid="book-count" className="font-semibold">
            {summary.count}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total pages</span>
          <span data-testid="total-pages" className="font-semibold">
            {summary.totalPages}
          </span>
        </div>

        <div data-testid="status-breakdown" className="pt-2 space-y-1">
          {summary.breakdown.map((row) => (
            <div
              key={row.name}
              data-testid="breakdown-row"
              className="flex justify-between"
            >
              <span data-testid="breakdown-name" className="text-gray-600">
                {row.name}
              </span>
              <span data-testid="breakdown-count" className="font-semibold">
                {row.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

