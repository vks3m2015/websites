"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        accountType: "CUSTOMER",
      });
      saveSession(auth);
      router.push("/");
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
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-sage-100 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold text-sage-900">Create your account</h1>
        <p className="mt-1 text-sm text-sage-600">Book wellness professionals near you.</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name" error={fieldErrors.name}>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone (optional if email provided)" error={fieldErrors.phone}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+91 9XXXXXXXXX"
            />
          </Field>
          <Field label="Password" error={fieldErrors.password}>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="At least 8 characters"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sage-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sage-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sage-800 underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-sage-600">
          Are you a professional?{" "}
          <Link href="/professional/onboarding" className="font-medium text-sage-800 underline">
            Register here
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(229 237 230);
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: rgb(119 165 126);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-sage-800">
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}
