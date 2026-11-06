"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validateField(name: string, value: string) {
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!EMAIL_RE.test(value.trim())) return "Please enter a valid email address";
    }
    if (name === "password") {
      if (!value) return "Password is required";
    }
    return "";
  }

  function handleChange(name: string, value: string) {
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    // Clear error for field when it becomes valid
    if (errors[name]) {
      const err = validateField(name, value);
      if (!err) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
      else setErrors((prev) => ({ ...prev, [name]: err }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateField("email", email);
    const passwordErr = validateField("password", password);
    const newErrors: Record<string, string> = {};
    if (emailErr) newErrors.email = emailErr;
    if (passwordErr) newErrors.password = passwordErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setAuthError("");
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setAuthError(error);
      return;
    }
    router.push("/books");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            data-testid="login-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
              />
              {errors.email && (
                <p data-testid="error-email" className="text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                autoComplete="current-password"
              />
              {errors.password && (
                <p data-testid="error-password" className="text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {authError && (
              <p data-testid="error-auth" className="text-sm text-red-600">
                {authError}
              </p>
            )}

            <Button
              data-testid="login-submit"
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Logging in…" : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

