import React, { useState } from 'react';
import { ProfessionalProfile } from '../types';
import { DELHI_NCR_AREAS } from '../data/locations';
import { SERVICE_CATEGORIES } from '../data/categories';
import { ProfessionalCard } from '../components/ProfessionalCard';
import {
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  Award,
  Sparkles,
  ChevronRight,
  HeartHandshake,
  Lock,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

interface HomePageProps {
  onSearch: (filters: { locationId?: string; categoryId?: string; query?: string }) => void;
  featuredPros: ProfessionalProfile[];
  onSelectPro: (pro: ProfessionalProfile) => void;
  onBookPro: (pro: ProfessionalProfile) => void;
  onNavigate: (page: string) => void;
  favorites: string[];
  onToggleFavorite: (proId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  featuredPros,
  onSelectPro,
  onBookPro,
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('del-hauzkhas');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      locationId: selectedLocation,
      categoryId: selectedCategory,
      query: searchQuery,
    });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy & Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Delhi NCR's Verified Wellness Exchange</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 text-balance leading-[1.12]">
                Certified Wellness Professionals Near You in Delhi NCR
              </h1>

              <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
                Connect directly with background-verified Ayurvedic Vaidyas, licensed clinical physiotherapists, restorative bodyworkers, and certified yoga masters across South Delhi, Gurugram, Noida, and Faridabad.
              </p>

              {/* Integrated Search Box */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xl max-w-2xl space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2"
              >
                {/* Location Picker */}
                <div className="sm:col-span-5 relative">
                  <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="">All Delhi NCR Hubs</option>
                    {DELHI_NCR_AREAS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Picker */}
                <div className="sm:col-span-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="">All Disciplines</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Quick Area Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
                <span className="font-semibold text-stone-400">Popular Hubs:</span>
                {[
                  { name: 'Hauz Khas', id: 'del-hauzkhas' },
                  { name: 'DLF Cyber City', id: 'ggn-cybercity' },
                  { name: 'Noida Sec 62', id: 'noida-sec62' },
                  { name: 'NIT Faridabad', id: 'fbd-nit' },
                  { name: 'Indirapuram', id: 'ghz-indirapuram' },
                ].map((hub) => (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(hub.id);
                      onSearch({ locationId: hub.id });
                    }}
                    className="text-stone-700 hover:text-emerald-900 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {hub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 aspect-[4/3] lg:aspect-[1/1] bg-stone-100">
                <img
                  src="/src/assets/images/hero_wellness_sanctuary_1790407805847.jpg"
                  alt="AyuNirvana Luxury Sanctuary"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Ayurvedic Wisdom & Clinical Care</span>
                  </div>
                  <p className="font-serif text-lg font-bold">
                    Safe, Respectful, & Verified Therapy Services
                  </p>
                  <p className="text-xs text-stone-200 mt-1">
                    Zero tolerance for non-wellness services · Strict credential auditing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Pillars (Mandatory Product Positioning) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-sm">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">
              Safety & Verification Standard
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              A Strictly Professional Wellness Platform
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              AyuNirvana is positioned exclusively for legitimate therapeutic treatments, pain management, and holistic wellbeing. Every practitioner undergoes rigorous onboarding before being approved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Certified Qualifications
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Medical degrees (BAMS, MPT, BPT) and Yoga Alliance accreditations verified by administrative audit.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Residential Privacy
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Therapist home addresses and client details are shielded. Masked contact lines keep communications safe.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Conflict-Safe Booking
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Real-time mutex lock prevents double bookings. Transparent cancellation policies protect both parties.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Verified Reviews Only
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Only clients with verified completed appointments can publish ratings. Zero fake or unmoderated reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Specialists Across Delhi NCR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">
              Top Rated in Delhi NCR
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Featured Verified Specialists
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Top practitioners ready for home sessions or clinic visits
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-stone-800 hover:text-emerald-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore All Specialists</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPros.slice(0, 4).map((pro) => (
            <ProfessionalCard
              key={pro.id}
              professional={pro}
              onSelect={onSelectPro}
              onBook={onBookPro}
              isFavorite={favorites.includes(pro.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Disciplines & Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">
            Curated Therapies
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Browse by Health & Wellness Discipline
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Targeted evidence-based care tailored to your physical recovery and mindfulness goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSearch({ categoryId: cat.id })}
              className="group bg-white rounded-2xl border border-stone-200/80 p-5 hover:border-emerald-800 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-emerald-50 text-stone-700 group-hover:text-emerald-800 flex items-center justify-center transition-colors mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-sm group-hover:text-emerald-900 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700 group-hover:text-emerald-900 font-semibold">
                <span>View Therapists</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-100/60 py-14 border-y border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">
              Simple & Reliable
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              How AyuNirvana Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <span className="font-mono text-2xl font-bold text-emerald-800">01</span>
              <h3 className="font-semibold text-stone-900 text-sm">Choose Your Location</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Filter by your neighborhood in Delhi NCR or let GPS pinpoint verified therapists within 5–15 km.
              </p>
            </div>

            <div className="text-center space-y-2">
              <span className="font-mono text-2xl font-bold text-emerald-800">02</span>
              <h3 className="font-semibold text-stone-900 text-sm">Review Credentials</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Check degrees, AYUSH or physiotherapy council registrations, pricing, and genuine client feedback.
              </p>
            </div>

            <div className="text-center space-y-2">
              <span className="font-mono text-2xl font-bold text-emerald-800">03</span>
              <h3 className="font-semibold text-stone-900 text-sm">Book Real-Time Slot</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Select your preferred day and time. Concurrency locking guarantees your reserved slot will not collide.
              </p>
            </div>

            <div className="text-center space-y-2">
              <span className="font-mono text-2xl font-bold text-emerald-800">04</span>
              <h3 className="font-semibold text-stone-900 text-sm">Therapy Session</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Receive certified therapy at your home or the specialist's clinic. Leave a verified review afterward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Practitioner CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Practitioner Community
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Are You a Certified Wellness Professional in Delhi NCR?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Expand your private practice. Join AyuNirvana to connect with discerning clients seeking authentic Ayurvedic therapy, clinical physiotherapy, or personalized yoga instruction.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Keep 90% of earnings
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Direct slot control
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() => onNavigate('onboard-pro')}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              Register As A Specialist
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Learn more about our standards, cancellation policies, and session options
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does AyuNirvana verify wellness professionals?',
              a: 'Every specialist must submit official educational degrees (e.g. BAMS, MPT, DNYS) and council registration numbers. Our compliance team verifies medical registrations against state AYUSH and physiotherapy boards before activating public profiles.',
            },
            {
              q: 'Can I book home visits across all parts of Delhi NCR?',
              a: 'Yes! Specialists specify their service areas across South, East, West, and Central Delhi, as well as Gurugram, Noida, Greater Noida, Ghaziabad, and Faridabad. Each specialist card indicates whether home visits or studio visits are available.',
            },
            {
              q: 'What is the cancellation and rescheduling policy?',
              a: 'Customers can cancel or reschedule appointments for free up to 4 hours prior to the scheduled start time directly from their dashboard. Cancellations within 4 hours are subject to a nominal specialist compensation charge.',
            },
            {
              q: 'How do you guarantee that no double bookings occur?',
              a: 'Our booking system uses a server-side transactional lock. When a customer selects an appointment slot, it is locked in real time. If another user attempts to book the same slot simultaneously, the transaction rolls back cleanly.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-1.5"
            >
              <h3 className="font-semibold text-stone-900 text-sm">{item.q}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
