import React, { useState } from 'react';
import { ProfessionalProfile } from '../types';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Heart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ProfessionalCardProps {
  professional: ProfessionalProfile & { distanceKm?: number };
  onSelect: (pro: ProfessionalProfile) => void;
  onBook: (pro: ProfessionalProfile) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (proId: string) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onSelect,
  onBook,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <article className="group relative bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col justify-between overflow-hidden">
        {/* Top visual and primary details */}
        <div>
          {/* Image & Favorite button */}
          <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
            {!imgError && professional.avatarUrl ? (
              <img
                src={professional.avatarUrl}
                alt={professional.fullName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                <Sparkles className="w-10 h-10 opacity-30" />
              </div>
            )}

            {/* Favorite action */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(professional.id);
                }}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600 shadow-sm'
                    : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                aria-label="Toggle favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
              </button>
            )}

            {/* Distance marker if available */}
            {professional.distanceKm !== undefined && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{professional.distanceKm} km away</span>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="p-5">
            {/* Header: Name & Verification */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  onClick={() => onSelect(professional)}
                  className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-900 transition-colors cursor-pointer leading-snug"
                >
                  {professional.fullName}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-medium line-clamp-1">
                  {professional.title}
                </p>
              </div>

              {professional.verificationStatus === 'VERIFIED' && (
                <div
                  className="flex items-center gap-1 text-emerald-700 shrink-0"
                  title="Verified Professional credentials on file"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-semibold tracking-tight">Verified</span>
                </div>
              )}
            </div>

            {/* Unboxed Metadata Discipline */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500 mt-3 pt-3 border-t border-stone-100">
              <span className="flex items-center gap-1 text-stone-900 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{professional.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({professional.reviewCount})</span>
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{professional.yearsExperience} yrs exp</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="truncate max-w-[140px]">{professional.primaryArea.split(',')[0]}</span>
            </div>

            {/* Bio snippet */}
            <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
              {professional.bio}
            </p>

            {/* Featured Services List */}
            {professional.services && professional.services.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider block">
                  Top Services
                </span>
                {professional.services.slice(0, 2).map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between text-xs text-stone-700"
                  >
                    <span className="truncate max-w-[190px]">{srv.name}</span>
                    <span className="font-mono text-stone-900 font-medium tabular-nums shrink-0">
                      ₹{srv.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 pt-0 mt-2 flex items-center justify-between gap-2.5">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-medium block">
              Starts at
            </span>
            <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
              ₹{professional.startingPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {professional.callingEnabled && (
              <button
                onClick={() => setShowCallModal(true)}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                title="Call Specialist"
                aria-label="Call Specialist"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
              </button>
            )}

            <button
              onClick={() => onBook(professional)}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Book Session
            </button>
          </div>
        </div>
      </article>

      {/* Masked Call Dialog */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-900">
              Contact Specialist
            </h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              In accordance with AyuNirvana privacy policy, verified specialist contact is connected securely.
            </p>

            <div className="my-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
              <p className="text-[11px] uppercase font-semibold text-stone-400">
                Direct Clinic Desk / Masked Line
              </p>
              <p className="font-mono text-base font-bold text-stone-900 mt-0.5">
                {professional.maskedPhone || '+91 98110 AyuNCR'}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                Available 09:00 AM – 07:00 PM IST
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCallModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href={`tel:${professional.maskedPhone || '+919811000000'}`}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
