"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";

const STEPS = ["Account", "Professional Info", "Services", "Availability", "Portfolio", "Verification"];

export default function ProfessionalOnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accountCreated, setAccountCreated] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const auth = await registerUser({
        name,
        email: email || undefined,
        phone: phone || undefined,
        password,
        accountType: "PROFESSIONAL",
      });
      saveSession(auth);
      setAccountCreated(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50 px-5 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-2xl font-semibold text-sage-900">
          Register as a wellness professional
        </h1>
        <p className="mt-1 text-sm text-sage-600">
          Step 1 of 6 — create your account. You'll add your services, availability and
          portfolio next.
        </p>

        {/* Step indicator */}
        <ol className="mt-6 flex flex-wrap gap-2 text-xs">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={`rounded-full px-3 py-1 ${
                i === 0
                  ? "bg-sage-600 text-white"
                  : accountCreated
                  ? "bg-sage-100 text-sage-600"
                  : "bg-sage-50 text-sage-400"
              }`}
            >
              {i + 1}. {step}
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-sage-100 bg-white p-8 shadow-sm">
          {!accountCreated ? (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-sage-800">
                  Full name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
                    placeholder="Your name"
                  />
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                </label>
                <label className="block text-sm font-medium text-sage-800">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="block text-sm font-medium text-sage-800">
                  Phone (optional if email provided)
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
                    placeholder="+91 9XXXXXXXXX"
                  />
                </label>
                <label className="block text-sm font-medium text-sage-800">
                  Password
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
                    placeholder="At least 8 characters"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sage-700 disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Continue"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-700">
                ✓
              </div>
              <h2 className="font-serif text-lg font-semibold text-sage-900">Account created</h2>
              <p className="mt-2 text-sm text-sage-600">
                Your professional profile has been started in <strong>draft</strong> status.
                Adding your services, availability, portfolio and verification documents is
                coming in the next build phase — for now your account and login are fully
                working.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-sage-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sage-700"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-sage-600">
          Looking to book a service instead?{" "}
          <Link href="/register" className="font-medium text-sage-800 underline">
            Sign up as a customer
          </Link>
        </p>
      </div>
    </main>
  );
}
