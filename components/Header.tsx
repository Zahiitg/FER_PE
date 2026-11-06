"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-indigo-600">
          ShelfLife
        </Link>

        {!loading && (
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <span data-testid="user-email" className="text-sm text-gray-600 hidden sm:block">
                  {user.email}
                </span>
                <Link
                  data-testid="link-books"
                  href="/books"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  My Books
                </Link>
                <Button
                  data-testid="btn-logout"
                  size="sm"
                  variant="ghost"
                  onClick={signOut}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  data-testid="btn-login"
                  href="/login"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Login
                </Link>
                <Link
                  data-testid="btn-register"
                  href="/register"
                  className={buttonVariants({ size: "sm" })}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
