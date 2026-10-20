import React from 'react';
import { DELHI_NCR_AREAS } from '../data/locations';
import { SERVICE_CATEGORIES } from '../data/categories';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLocationId: string;
  onLocationChange: (locId: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (catId: string) => void;
  maxPrice: number;
  onMaxPriceChange: (p: number) => void;
  minRating: number;
  onMinRatingChange: (r: number) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedLocationId,
  onLocationChange,
  selectedCategoryId,
  onCategoryChange,
  maxPrice,
  onMaxPriceChange,
  minRating,
  onMinRatingChange,
  onResetFilters,
  totalResults,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedLocationId) ||
    Boolean(selectedCategoryId) ||
    maxPrice < 4000 ||
    minRating > 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4 sm:p-5 mb-8">
      {/* Search Input & Location Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Text Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by therapist name, technique, e.g. 'Abhyanga', 'Dry Needling'..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 transition-all text-stone-800 placeholder-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="md:col-span-3 relative">
          <MapPin className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-8 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-800 appearance-none font-medium cursor-pointer"
          >
            <option value="">All Delhi NCR Locations</option>
            {DELHI_NCR_AREAS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-3">
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-800 font-medium cursor-pointer"
          >
            <option value="">All Therapies & Disciplines</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary Interactive Filter Controls (Segmented Tabs / Quick Filters) */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
            Filter:
          </span>

          {/* Rating filter segmented */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => onMinRatingChange(0)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                minRating === 0
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Any Rating
            </button>
            <button
              onClick={() => onMinRatingChange(4.8)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                minRating === 4.8
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ★ 4.8+
            </button>
            <button
              onClick={() => onMinRatingChange(4.9)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                minRating === 4.9
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ★ 4.9+
            </button>
          </div>

          {/* Max Price Segmented */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => onMaxPriceChange(4000)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                maxPrice >= 4000
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Any Price
            </button>
            <button
              onClick={() => onMaxPriceChange(1500)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                maxPrice === 1500
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ≤ ₹1,500
            </button>
            <button
              onClick={() => onMaxPriceChange(2200)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                maxPrice === 2200
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ≤ ₹2,200
            </button>
          </div>
        </div>

        {/* Right side: Results count & Reset action */}
        <div className="flex items-center gap-3">
          <span className="text-stone-500 font-medium font-mono tabular-nums">
            {totalResults} {totalResults === 1 ? 'specialist found' : 'specialists found'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-stone-500 hover:text-stone-900 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
