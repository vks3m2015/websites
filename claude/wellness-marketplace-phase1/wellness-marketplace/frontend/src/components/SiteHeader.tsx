import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-sage-100 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-serif text-xl font-semibold text-sage-800">
          Sohum <span className="text-sage-500">Wellness</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-sage-700 md:flex">
          <Link href="/search" className="hover:text-sage-900">
            Find Professionals
          </Link>
          <Link href="/professional/onboarding" className="hover:text-sage-900">
            Become a Professional
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sage-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
