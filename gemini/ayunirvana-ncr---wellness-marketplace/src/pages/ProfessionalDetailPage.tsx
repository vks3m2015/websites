import React, { useState } from 'react';
import { ProfessionalProfile, Review, User } from '../types';
import { api } from '../services/api';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  Award,
  Languages,
  ShieldAlert,
  ArrowLeft,
  Heart,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { ReportModal } from '../components/ReportModal';

interface ProfessionalDetailPageProps {
  professional: ProfessionalProfile;
  currentUser: User;
  onBack: () => void;
  onBookService: (serviceId?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (proId: string) => void;
}

export const ProfessionalDetailPage: React.FC<ProfessionalDetailPageProps> = ({
  professional,
  currentUser,
  onBack,
  onBookService,
  isFavorite,
  onToggleFavorite,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const reviews = api.getReviewsForProfessional(professional.id);

  const images = professional.portfolioImages && professional.portfolioImages.length > 0
    ? professional.portfolioImages
    : [professional.avatarUrl];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Specialists</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(professional.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-700' : ''}`} />
            <span>{isFavorite ? 'Saved to Favorites' : 'Save Specialist'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
            title="Report this profile"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Images, Bio, Services, Reviews) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visual Header */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Photo & thumbnails */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={images[activeImageIdx] || professional.avatarUrl}
                    alt={professional.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImageIdx === i ? 'border-emerald-700' : 'border-stone-200 opacity-70'
                        }`}
                      >
                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Professional Profile</span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    {professional.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
                    {professional.title}
                  </p>

                  {/* Unboxed Metadata Line */}
                  <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500 mt-4 pt-4 border-t border-stone-100">
                    <span className="flex items-center gap-1 text-stone-900 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{professional.rating.toFixed(1)}</span>
                      <span className="text-stone-400 font-normal">({professional.reviewCount} reviews)</span>
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>{professional.yearsExperience} Years Experience</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {professional.primaryArea}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
                    <Languages className="w-3.5 h-3.5 text-stone-400" />
                    <span>Languages: {professional.languages.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 uppercase font-semibold">Starting Fee</span>
                    <p className="font-mono text-xl font-bold text-stone-900 tabular-nums">
                      ₹{professional.startingPrice.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => onBookService()}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Check Available Slots
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About & Verified Qualifications */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                About the Practitioner
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                {professional.bio}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-serif text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Verified Qualifications & Council Accreditations</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {professional.qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="font-medium">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Approximate Service Area & Privacy */}
            <div className="pt-4 border-t border-stone-100">
              <h3 className="font-serif text-sm font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Service Coverage Area (~{professional.serviceRadiusKm} km Radius)</span>
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                To protect practitioner privacy, exact residential coordinates are never published. This specialist travels across the following Delhi NCR neighborhoods:
              </p>
              <div className="flex flex-wrap gap-2">
                {professional.serviceAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Services & Therapies List */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Services Offered
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Select a therapy below to view available dates and time slots
              </p>
            </div>

            <div className="space-y-3">
              {professional.services?.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-emerald-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/30 hover:bg-stone-50/60"
                >
                  <div className="space-y-1 max-w-lg">
                    <h3 className="font-semibold text-stone-900 text-sm">{srv.name}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{srv.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {srv.durationMinutes} Minutes
                      </span>
                      <span>·</span>
                      <span>{srv.isHomeService ? 'Home Visit Available' : 'Clinic Only'}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                    <span className="font-mono text-base sm:text-lg font-bold text-stone-900 tabular-nums">
                      ₹{srv.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onBookService(srv.id)}
                      className="px-4 py-2 bg-stone-900 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Book This Therapy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Client Reviews & Ratings
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  100% verified appointments completed through AyuNirvana
                </p>
              </div>
              <div className="text-right">
                <span className="font-serif text-2xl font-bold text-stone-900">
                  {professional.rating.toFixed(1)}
                </span>
                <span className="text-xs text-stone-400 block">out of 5</span>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {reviews.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">
                  No public reviews posted yet. Be the first to book and share your feedback!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs">
                          {rev.customerName.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-stone-900">{rev.customerName}</p>
                          <span className="text-[10px] text-stone-400">
                            Verified Appointment · {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed pl-9">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Purchase Module */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-md space-y-5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
              Book Appointment
            </span>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-500">From</span>
                <span className="font-mono text-2xl font-bold text-stone-900 ml-1 tabular-nums">
                  ₹{professional.startingPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{professional.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({professional.reviewCount})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Instant confirmation with concurrency lock</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Free cancellation up to 4 hrs before session</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Professional brings sanitised linen & materials</span>
              </div>
            </div>

            <button
              onClick={() => onBookService()}
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Select Date & Time Slot</span>
            </button>

            {professional.callingEnabled && (
              <a
                href={`tel:${professional.maskedPhone || '+919811000000'}`}
                className="w-full py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-800" />
                <span>Call Clinic Desk ({professional.maskedPhone || '+91 98110...'})</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Safety Report Dialog */}
      {showReportModal && (
        <ReportModal
          reportedEntityId={professional.id}
          reportedEntityType="PROFESSIONAL"
          reporterUserId={currentUser.id}
          entityName={professional.fullName}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
