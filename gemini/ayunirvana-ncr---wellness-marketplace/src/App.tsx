import React, { useState } from 'react';
import { User, ProfessionalProfile, Booking } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProfessionalDetailPage } from './pages/ProfessionalDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OnboardingProPage } from './pages/OnboardingProPage';
import { BookingModal } from './components/BookingModal';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedPro, setSelectedPro] = useState<ProfessionalProfile | null>(null);
  const [bookingPro, setBookingPro] = useState<ProfessionalProfile | null>(null);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | undefined>(undefined);

  // Search state
  const [searchFilters, setSearchFilters] = useState<{
    locationId?: string;
    categoryId?: string;
    query?: string;
  }>({});

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(
    api.getCustomerFavorites(currentUser.id).map((p) => p.id)
  );

  const handleToggleFavorite = (proId: string) => {
    const isAdded = api.toggleFavorite(currentUser.id, proId);
    if (isAdded) {
      setFavorites([...favorites, proId]);
    } else {
      setFavorites(favorites.filter((id) => id !== proId));
    }
  };

  const handleSearchNavigate = (filters: { locationId?: string; categoryId?: string; query?: string }) => {
    setSearchFilters(filters);
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPro = (pro: ProfessionalProfile) => {
    setSelectedPro(pro);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookPro = (pro: ProfessionalProfile, serviceId?: string) => {
    setBookingPro(pro);
    setPreSelectedServiceId(serviceId);
  };

  const allPros = api.getAllProfessionalsAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onSearch={handleSearchNavigate}
            featuredPros={allPros}
            onSelectPro={handleSelectPro}
            onBookPro={handleBookPro}
            onNavigate={setCurrentPage}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            initialLocationId={searchFilters.locationId}
            initialCategoryId={searchFilters.categoryId}
            initialQuery={searchFilters.query}
            professionals={allPros}
            onSelectPro={handleSelectPro}
            onBookPro={handleBookPro}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'detail' && selectedPro && (
          <ProfessionalDetailPage
            professional={selectedPro}
            currentUser={currentUser}
            onBack={() => setCurrentPage('search')}
            onBookService={(srvId) => handleBookPro(selectedPro, srvId)}
            isFavorite={favorites.includes(selectedPro.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            onSelectCategory={(catId) => handleSearchNavigate({ categoryId: catId })}
          />
        )}

        {currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            currentUser={currentUser}
            onBookPro={handleBookPro}
            onSelectPro={handleSelectPro}
          />
        )}

        {currentPage === 'pro-dashboard' && (
          <ProfessionalDashboard currentUser={currentUser} />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {currentPage === 'onboard-pro' && (
          <OnboardingProPage
            onCompleted={() => {
              setCurrentUser(api.getCurrentUser());
              setCurrentPage('pro-dashboard');
            }}
          />
        )}
      </main>

      {/* Global Booking Modal */}
      {bookingPro && (
        <BookingModal
          professional={bookingPro}
          currentUser={currentUser}
          preSelectedServiceId={preSelectedServiceId}
          onClose={() => setBookingPro(null)}
          onBookingSuccess={(booking) => {
            // Keep modal open showing confirmation, or user can close to go to dashboard
          }}
        />
      )}

      {/* Footer (Zero telemetry, strict clean layout) */}
      <footer className="bg-white border-t border-stone-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
                  AyuNirvana
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Delhi NCR's verified healthcare & wellness marketplace. Connecting discerning clients with licensed Ayurvedic Vaidyas, clinical physiotherapists, and accredited wellness practitioners.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Strict Anti-Adult Services Standard</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Delhi NCR Hubs
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li>South Delhi (Hauz Khas, GK, Saket)</li>
                <li>Gurugram (Cyber City, Golf Course Rd)</li>
                <li>Noida (Sector 18, 62, 137 Expressway)</li>
                <li>Faridabad (NIT, Sector 15, Surajkund)</li>
                <li>Ghaziabad (Indirapuram, Vaishali)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Disciplines
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li>Traditional Sarvanga Abhyanga & Shirodhara</li>
                <li>Spine Decompression & Sports Physiotherapy</li>
                <li>Clinical Myotherapy & Deep Tissue</li>
                <li>Hatha, Iyengar & Restorative Yin Yoga</li>
                <li>Acupressure & Naturopathy Fomentation</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Safety & Compliance
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li>AYUSH & Medical Council Verification</li>
                <li>Server-Side Mutual Concurrency Lock</li>
                <li>Residential Address Privacy Shield</li>
                <li>4-Hour Free Cancellation Policy</li>
                <li>Masked Telephony Connection</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
            <p>© 2026 AyuNirvana Wellness NCR. All rights reserved.</p>
            <p className="text-[11px] text-stone-400">
              Strictly therapeutic services · Certified Indian & International Accreditations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
