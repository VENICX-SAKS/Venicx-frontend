"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
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
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", { email, password });
      setToken(res.token);
      window.location.href = "/dashboard";
    } catch (e) {
      if (e instanceof ApiError) {
        setError(
          e.status === 401
            ? "Invalid email or password"
            : `Error ${e.status}: ${e.message}`
        );
      } else if (e instanceof TypeError && (e.message.includes("fetch") || e.message.includes("network"))) {
        setError(`Network error — cannot reach the backend.`);
      } else {
        setError(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-royal_blue flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements matching landing page */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-[40rem] h-[40rem] bg-vibrant_orange/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Honeycomb pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='30' viewBox='0 0 52 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M10 0l10 5.773v11.547L10 23.094 0 17.32V5.773z'/%3E%3Cpath d='M36 0l10 5.773v11.547L36 23.094 26 17.32V5.773z'/%3E%3Cpath d='M23 15l10 5.773v11.547L23 38.094 13 32.32V20.773z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '52px 30px'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-12">
          <Logo size="lg" variant="light" />
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 md:p-12 shadow-2xl">
          <div className="space-y-2 mb-8">
            <h2 className="font-outfit text-3xl font-black text-white">Partner Login</h2>
            <p className="text-white/60 font-medium">Access your VeniCX dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-white/80 uppercase tracking-widest">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full p-5 rounded-2xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-vibrant_orange focus:bg-white/10 outline-none font-bold transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-white/80 uppercase tracking-widest">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full p-5 rounded-2xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-vibrant_orange focus:bg-white/10 outline-none font-bold transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-white font-bold text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vibrant_orange hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <a href="/" className="text-white/60 hover:text-white font-bold text-sm transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
