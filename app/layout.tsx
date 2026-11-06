import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BooksProvider } from "@/contexts/BooksContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "ShelfLife",
  description: "Track the books you want to read, are reading, or have finished.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <AuthProvider>
          <BooksProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </BooksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
