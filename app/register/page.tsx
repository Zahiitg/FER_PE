"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validateField(name: string, value: string, pwdVal?: string) {
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!EMAIL_RE.test(value.trim())) return "Please enter a valid email address";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
    }
    if (name === "confirm") {
      if (!value) return "Confirm password is required";
      if (value !== (pwdVal ?? password)) return "Passwords do not match";
    }
    return "";
  }

  function handleChange(name: string, value: string) {
    if (success) setSuccess(false);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "confirm") setConfirm(value);

    if (errors[name]) {
      const err = validateField(name, value, name === "confirm" ? password : undefined);
      if (!err) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
      else setErrors((prev) => ({ ...prev, [name]: err }));
    }
    // Also recheck confirm if password changes
    if (name === "password" && errors.confirm) {
      const confirmErr = validateField("confirm", confirm, value);
      if (!confirmErr) setErrors((prev) => { const n = { ...prev }; delete n.confirm; return n; });
      else setErrors((prev) => ({ ...prev, confirm: confirmErr }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateField("email", email);
    const passwordErr = validateField("password", password);
    const confirmErr = validateField("confirm", confirm, password);
    const newErrors: Record<string, string> = {};
    if (emailErr) newErrors.email = emailErr;
    if (passwordErr) newErrors.password = passwordErr;
    if (confirmErr) newErrors.confirm = confirmErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setAuthError("");
    setSubmitting(true);
    const { error } = await signUp(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setAuthError(error);
      return;
    }
    setSuccess(true);
    setEmail("");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            data-testid="register-form"
            noValidate
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                data-testid="register-email"
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
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                data-testid="register-password"
                type="password"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                autoComplete="new-password"
              />
              {errors.password && (
                <p data-testid="error-password" className="text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                data-testid="register-confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirm && (
                <p data-testid="error-confirm-password" className="text-sm text-red-600">
                  {errors.confirm}
                </p>
              )}
            </div>

            {authError && (
              <p data-testid="error-auth" className="text-sm text-red-600">
                {authError}
              </p>
            )}

            {success && (
              <p data-testid="form-success" className="text-sm text-green-600">
                Registration successful
              </p>
            )}

            <Button
              data-testid="register-submit"
              type="submit"
              className="w-full"
              disabled={submitting || success}
            >
              {submitting ? "Registering…" : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

