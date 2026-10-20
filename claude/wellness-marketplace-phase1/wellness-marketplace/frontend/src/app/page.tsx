import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const AREAS = ["Faridabad", "Noida", "Gurugram", "Ghaziabad", "South Delhi", "Central Delhi"];

const SERVICES = [
  { name: "Deep Tissue Massage", price: "from ₹1,200" },
  { name: "Physiotherapy", price: "from ₹900" },
  { name: "Yoga & Meditation", price: "from ₹600" },
  { name: "Ayurvedic Therapy", price: "from ₹1,500" },
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 text-center">
        <p className="mb-3 inline-block rounded-full bg-sage-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-sage-700">
          Verified professionals · Delhi NCR
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight text-sage-900 sm:text-5xl">
          Find trusted wellness professionals near you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sage-700">
          Massage therapists, physiotherapists, yoga instructors and more —
          verified, rated, and bookable in minutes.
        </p>

        <form
          action="/search"
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-sage-100 bg-white p-3 shadow-sm sm:flex-row"
        >
          <input
            name="location"
            placeholder="Location (e.g. Sector 21, Faridabad)"
            className="flex-1 rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
          />
          <input
            name="service"
            placeholder="What service are you looking for?"
            className="flex-1 rounded-xl border border-sage-100 px-4 py-3 text-sm outline-none focus:border-sage-400"
          />
          <button
            type="submit"
            className="rounded-xl bg-sage-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sage-700"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-sage-600">
          <span>Popular areas:</span>
          {AREAS.map((a) => (
            <Link
              key={a}
              href={`/search?location=${encodeURIComponent(a)}`}
              className="rounded-full border border-sage-200 px-3 py-1 hover:bg-sage-50"
            >
              {a}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="mb-6 font-serif text-2xl font-semibold text-sage-900">Popular services</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.name} className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm">
              <p className="font-medium text-sage-900">{s.name}</p>
              <p className="mt-1 text-sm text-sage-600">{s.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-50 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="mb-8 font-serif text-2xl font-semibold text-sage-900">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Search nearby", desc: "Tell us your location and the service you need." },
              { step: "2", title: "Compare & choose", desc: "Filter by rating, price, distance and availability." },
              { step: "3", title: "Book instantly", desc: "Pick a slot and confirm — no back-and-forth calls." },
            ].map((s) => (
              <div key={s.step}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-sage-600 text-sm font-semibold text-white">
                  {s.step}
                </div>
                <p className="font-medium text-sage-900">{s.title}</p>
                <p className="mt-1 text-sm text-sage-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / safety */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-2xl border border-sage-100 bg-white p-8 shadow-sm sm:p-10">
          <h2 className="font-serif text-2xl font-semibold text-sage-900">Safety is built in</h2>
          <p className="mt-2 max-w-2xl text-sage-700">
            Every professional goes through an identity and credential verification step before
            they can appear in search. Reviews are only left by customers with a completed
            booking, and every profile can be reported directly.
          </p>
        </div>
      </section>

      {/* Professional CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-sage-800 p-8 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h3 className="font-serif text-xl font-semibold">Are you a wellness professional?</h3>
            <p className="mt-1 text-sm text-sage-100">
              Join the platform, set your own schedule and prices, and get discovered by customers near you.
            </p>
          </div>
          <Link
            href="/professional/onboarding"
            className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-sage-800 hover:bg-sage-50"
          >
            Register as a professional
          </Link>
        </div>
      </section>

      <footer className="border-t border-sage-100 py-8 text-center text-xs text-sage-500">
        © {new Date().getFullYear()} Sohum Wellness · Delhi NCR
      </footer>
    </main>
  );
}
