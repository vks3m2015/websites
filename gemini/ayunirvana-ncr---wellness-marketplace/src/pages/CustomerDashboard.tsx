import React, { useState } from 'react';
import { Booking, User, ProfessionalProfile } from '../types';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Star,
  ChevronRight,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { ReviewModal } from '../components/ReviewModal';

interface CustomerDashboardProps {
  currentUser: User;
  onBookPro: (pro: ProfessionalProfile) => void;
  onSelectPro: (pro: ProfessionalProfile) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onBookPro,
  onSelectPro,
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'FAVORITES'>('UPCOMING');
  const [bookings, setBookings] = useState<Booking[]>(api.getCustomerBookings(currentUser.id));
  const [favorites, setFavorites] = useState<ProfessionalProfile[]>(
    api.getCustomerFavorites(currentUser.id)
  );

  // Modals state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Schedule conflict');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('11:00');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'PENDING'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status.startsWith('CANCELLED') || b.status === 'REJECTED'
  );

  const handleCancelSubmit = () => {
    if (!cancelBooking) return;
    try {
      api.cancelBooking(cancelBooking.id, currentUser.id, cancelReason);
      setBookings(api.getCustomerBookings(currentUser.id));
      setCancelBooking(null);
      setCancelError(null);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel appointment.');
    }
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleBooking || !newDate || !newSlot) return;
    try {
      const endHour = parseInt(newSlot.split(':')[0], 10) + 1;
      const newEndTime = `${String(endHour).padStart(2, '0')}:${newSlot.split(':')[1] || '00'}`;

      api.rescheduleBooking(
        rescheduleBooking.id,
        currentUser.id,
        newDate,
        newSlot,
        newEndTime
      );
      setBookings(api.getCustomerBookings(currentUser.id));
      setRescheduleBooking(null);
      setRescheduleError(null);
    } catch (err: any) {
      setRescheduleError(err.message || 'Unable to reschedule to that slot.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
            Customer Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            My Appointments & Care
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Logged in as {currentUser.fullName} ({currentUser.email})
          </p>
        </div>

        {/* Tab segmented controls */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('PAST')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'PAST'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            History & Reviews ({pastBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('FAVORITES')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'FAVORITES'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {/* Tab: Upcoming Appointments */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-3">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                No Upcoming Appointments
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Schedule a personalized session with certified Ayurvedic Vaidyas, physiotherapists, or yoga coaches.
              </p>
            </div>
          ) : (
            upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/80">
                      Confirmed Appointment
                    </span>
                    <span className="font-mono text-xs text-stone-400">ID: {b.id}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {b.serviceName}
                  </h3>
                  <p className="text-xs font-semibold text-stone-700">
                    With {b.professionalName} · {b.professionalArea}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                      <span className="font-medium">{b.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-800" />
                      <span className="font-medium">{b.startTime} - {b.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{b.serviceMode === 'HOME_VISIT' ? 'Home Visit' : 'Studio Clinic'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 pt-1">
                    Address: {b.address}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Paid</span>
                    <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
                      ₹{b.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRescheduleBooking(b);
                        setNewDate(b.date);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCancelBooking(b)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Past Appointments & Reviews */}
      {activeTab === 'PAST' && (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-2">
              <p className="text-xs text-stone-500">No past bookings found.</p>
            </div>
          ) : (
            pastBookings.map((b) => {
              const reviews = api.getReviewsForProfessional(b.professionalId);
              const alreadyReviewed = reviews.some((r) => r.bookingId === b.id);

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {b.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">{b.date}</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900">{b.serviceName}</h3>
                    <p className="text-xs text-stone-600">With {b.professionalName}</p>
                    {b.cancellationReason && (
                      <p className="text-xs text-rose-700">Reason: {b.cancellationReason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-stone-700 tabular-nums">
                      ₹{b.totalAmount.toLocaleString()}
                    </span>

                    {b.status === 'COMPLETED' && (
                      alreadyReviewed ? (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Review Submitted</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
                        >
                          Write Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Favorites */}
      {activeTab === 'FAVORITES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-2">
              <Heart className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">
                You haven't saved any specialists yet. Click the heart icon on any specialist card to bookmark them.
              </p>
            </div>
          ) : (
            favorites.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={pro.avatarUrl}
                    alt={pro.fullName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3
                      onClick={() => onSelectPro(pro)}
                      className="font-serif font-bold text-stone-900 text-sm hover:text-emerald-900 cursor-pointer"
                    >
                      {pro.fullName}
                    </h3>
                    <p className="text-xs text-stone-500 truncate max-w-[180px]">{pro.title}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <span className="font-semibold text-stone-900">
                    ★ {pro.rating.toFixed(1)} ({pro.reviewCount})
                  </span>
                  <span className="font-mono text-stone-900 font-bold">
                    From ₹{pro.startingPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onBookPro(pro)}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cancellation Dialog with Business Rule Window */}
      {cancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-serif text-lg font-bold text-stone-900">Cancel Appointment?</h3>
              <p className="text-xs text-stone-500 mt-1">
                AyuNirvana policy allows free cancellation up to 4 hours before the appointment time.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {cancelError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Cancellation Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Health emergency">Health emergency</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Other personal reason">Other personal reason</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelBooking(null)}
                className="w-full py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelSubmit}
                className="w-full py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="text-center">
              <h3 className="font-serif text-lg font-bold text-stone-900">Reschedule Session</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Pick a new date and start time for {rescheduleBooking.serviceName}
              </p>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {rescheduleError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">New Date:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Time:</label>
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRescheduleBooking(null)}
                className="w-full py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="w-full py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl"
              >
                Update Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal (Only for completed bookings) */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          currentUser={currentUser}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            setBookings(api.getCustomerBookings(currentUser.id));
          }}
        />
      )}
    </div>
  );
};
