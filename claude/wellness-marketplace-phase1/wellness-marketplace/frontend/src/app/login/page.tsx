"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await loginUser({ identifier, password });
      saveSession(auth);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.code === "INVALID_CREDENTIALS" ? "Incorrect email/phone or password." : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-sage-100 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold text-sage-900">Welcome back</h1>
        <p className="mt-1 text-sm text-sage-600">Log in to manage your bookings.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-sage-800">
            Email or phone
            <input
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-medium text-sage-800">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sage-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sage-600">
          New here?{" "}
          <Link href="/register" className="font-medium text-sage-800 underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
