"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api";
import { setToken, isAuthenticated } from "@/lib/auth";
import type { LoginResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", { email, password });
      setToken(res.token);
      // Force a full page reload to ensure auth context picks up the token
      window.location.href = "/";
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.status === 401 ? "Invalid email or password" : e.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">VeniCX</span>
          </div>

          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Sign in</h2>
          <p className="text-sm text-neutral-500 mb-6">Enter your credentials to continue</p>

          <div className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />

            {error && (
              <p className="text-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              onClick={handleSubmit}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
