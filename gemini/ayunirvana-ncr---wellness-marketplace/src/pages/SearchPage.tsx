import React, { useState, useMemo } from 'react';
import { ProfessionalProfile } from '../types';
import { DELHI_NCR_AREAS } from '../data/locations';
import { FilterBar } from '../components/FilterBar';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { MapPin, Navigation, Sparkles, AlertCircle } from 'lucide-react';

interface SearchPageProps {
  initialLocationId?: string;
  initialCategoryId?: string;
  initialQuery?: string;
  professionals: ProfessionalProfile[];
  onSelectPro: (pro: ProfessionalProfile) => void;
  onBookPro: (pro: ProfessionalProfile) => void;
  favorites: string[];
  onToggleFavorite: (proId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialLocationId = '',
  initialCategoryId = '',
  initialQuery = '',
  professionals,
  onSelectPro,
  onBookPro,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialLocationId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(25);

  const selectedLocation = DELHI_NCR_AREAS.find((a) => a.id === selectedLocationId);

  // Filter and calculate distance
  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((pro) => pro.verificationStatus === 'VERIFIED')
      .map((pro) => {
        let distanceKm: number | undefined = undefined;
        if (selectedLocation) {
          // Haversine distance
          const R = 6371;
          const dLat = ((pro.coordinates.latitude - selectedLocation.coordinates.latitude) * Math.PI) / 180;
          const dLon = ((pro.coordinates.longitude - selectedLocation.coordinates.longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((selectedLocation.coordinates.latitude * Math.PI) / 180) *
              Math.cos((pro.coordinates.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceKm = Math.round(R * c * 10) / 10;
        }

        return { ...pro, distanceKm };
      })
      .filter((pro) => {
        // Location radius filter if location chosen
        if (selectedLocation && pro.distanceKm !== undefined) {
          if (pro.distanceKm > selectedRadiusKm) return false;
        }

        // Category filter
        if (selectedCategoryId) {
          const matchCat = pro.services?.some((s) => s.categoryId === selectedCategoryId);
          if (!matchCat) return false;
        }

        // Rating filter
        if (minRating > 0 && pro.rating < minRating) return false;

        // Max price filter
        if (maxPrice < 4000 && pro.startingPrice > maxPrice) return false;

        // Query filter
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = pro.fullName.toLowerCase().includes(q);
          const matchTitle = pro.title.toLowerCase().includes(q);
          const matchArea = pro.primaryArea.toLowerCase().includes(q) || pro.serviceAreas.some((a) => a.toLowerCase().includes(q));
          const matchService = pro.services?.some((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
          if (!matchName && !matchTitle && !matchArea && !matchService) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return b.rating - a.rating;
      });
  }, [
    professionals,
    selectedLocation,
    selectedRadiusKm,
    selectedCategoryId,
    minRating,
    maxPrice,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocationId('');
    setSelectedCategoryId('');
    setMaxPrice(4000);
    setMinRating(0);
    setSelectedRadiusKm(25);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
            Delhi NCR Directory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            Verified Wellness Specialists
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {selectedLocation ? (
              <span>
                Showing specialists near <strong className="text-stone-800">{selectedLocation.name}</strong> within {selectedRadiusKm} km
              </span>
            ) : (
              <span>Browse certified practitioners across all Delhi NCR districts</span>
            )}
          </p>
        </div>

        {/* Radius selector if location chosen */}
        {selectedLocation && (
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-stone-500 px-2">Radius:</span>
            {[10, 15, 25, 40].map((km) => (
              <button
                key={km}
                onClick={() => setSelectedRadiusKm(km)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  selectedRadiusKm === km
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        onResetFilters={handleResetFilters}
        totalResults={filteredProfessionals.length}
      />

      {/* Results Grid */}
      {filteredProfessionals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              No Specialists Found in this Radius
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              We couldn't find verified professionals matching your current filters. Try expanding your search radius or selecting a different therapy category.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((pro) => (
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
      )}
    </div>
  );
};
