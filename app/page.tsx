import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, Search } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Add Books",
    description: "Add any book to your personal shelf with title, author, pages and status.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Move books from To Read → Reading → Finished as you go.",
  },
  {
    icon: Search,
    title: "Search Your Shelf",
    description: "Filter and search by title, author or reading status instantly.",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 data-testid="home-title" className="text-5xl font-extrabold text-indigo-600 mb-4">
        ShelfLife
      </h1>
      <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto">
        Your personal reading list — keep track of every book you want to read,
        are currently reading, or have already finished.
      </p>

      <div className="grid gap-6 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="text-left">
            <CardHeader className="pb-2">
              <Icon className="w-8 h-8 text-indigo-500 mb-2" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
