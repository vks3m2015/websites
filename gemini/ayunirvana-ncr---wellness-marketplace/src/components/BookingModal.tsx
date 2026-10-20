import React, { useState, useEffect } from 'react';
import {
  ProfessionalProfile,
  ProfessionalService,
  TimeSlot,
  User,
  Booking,
} from '../types';
import { api } from '../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  ShieldCheck,
  Home,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface BookingModalProps {
  professional: ProfessionalProfile;
  currentUser: User;
  preSelectedServiceId?: string;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  professional,
  currentUser,
  preSelectedServiceId,
  onClose,
  onBookingSuccess,
}) => {
  const services = professional.services || [];
  const [selectedService, setSelectedService] = useState<ProfessionalService | null>(
    services.find((s) => s.id === preSelectedServiceId) || services[0] || null
  );

  // Dates: Next 10 available days
  const availableDates = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Starting from tomorrow
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Service mode & address
  const [serviceMode, setServiceMode] = useState<'HOME_VISIT' | 'PROFESSIONAL_STUDIO'>('HOME_VISIT');
  const [address, setAddress] = useState<string>('B-12, Sector 15, Faridabad, NCR');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (Google Pay / PhonePe)');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load available slots when professional or date changes
  useEffect(() => {
    if (!selectedDate || !professional.id) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    setBookingError(null);

    try {
      const generated = api.getAvailableSlots(professional.id, selectedDate);
      setSlots(generated);
      // Auto select first available slot
      const firstAvailable = generated.find((s) => s.isAvailable);
      if (firstAvailable) setSelectedSlot(firstAvailable);
    } catch (err: any) {
      setBookingError('Unable to load available slots for this date.');
    } finally {
      setLoadingSlots(false);
    }
  }, [professional.id, selectedDate]);

  // Pricing calculations
  const basePrice = selectedService ? selectedService.price : 0;
  const platformFee = Math.round(basePrice * 0.1);
  const tax = Math.round(basePrice * 0.05);
  const totalAmount = basePrice + tax;

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedSlot) {
      setBookingError('Please select both a service and an available time slot.');
      return;
    }

    if (serviceMode === 'HOME_VISIT' && !address.trim()) {
      setBookingError('Please provide your residential address for the home appointment.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      // Concurrency-safe atomic booking call with idempotency token
      const idempotencyKey = `bk_idempotent_${currentUser.id}_${professional.id}_${selectedDate}_${selectedSlot.startTime}`;

      const booking = api.createBooking({
        customerId: currentUser.id,
        professionalId: professional.id,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        serviceMode,
        address: serviceMode === 'HOME_VISIT' ? address : professional.primaryArea,
        notes,
        paymentMethod,
        idempotencyKey,
      });

      setConfirmedBooking(booking);
      onBookingSuccess(booking);
    } catch (err: any) {
      // Catches slot concurrency collisions or rule violations
      setBookingError(err.message || 'The selected slot was taken or an error occurred.');
      // Refresh slots immediately to show latest availability
      const updated = api.getAvailableSlots(professional.id, selectedDate);
      setSlots(updated);
      setSelectedSlot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
              Verified Wellness Appointment
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {confirmedBooking ? 'Booking Confirmed' : `Book with ${professional.fullName}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/80 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {confirmedBooking ? (
          /* Confirmation Screen */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-stone-900">
              Appointment Reserved!
            </h4>
            <p className="text-sm text-stone-600 mt-1 max-w-md mx-auto">
              Your session with {professional.fullName} has been confirmed. You will receive SMS & in-app updates.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Booking ID:</span>
                <span className="font-mono font-bold text-stone-900">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Service:</span>
                <span className="font-semibold text-stone-900">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Date & Slot:</span>
                <span className="font-semibold text-stone-900">
                  {confirmedBooking.date} · {confirmedBooking.startTime} - {confirmedBooking.endTime}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500">Service Mode:</span>
                <span className="font-semibold text-stone-900">
                  {confirmedBooking.serviceMode === 'HOME_VISIT' ? 'Home Visit' : "Specialist's Studio"}
                </span>
              </div>
              <div className="flex justify-between py-1 pt-2 text-stone-900 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono text-sm">₹{confirmedBooking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              View in My Appointments
            </button>
          </div>
        ) : (
          /* Multi-Step Booking Form */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Error Banner if collision or validation fails */}
            {bookingError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block">Booking Conflict</span>
                  {bookingError}
                </div>
              </div>
            )}

            {/* Step 1: Select Service */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                1. Select Therapy or Service
              </label>
              <div className="grid grid-cols-1 gap-2">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedService?.id === srv.id
                        ? 'bg-emerald-50/50 border-emerald-700 ring-1 ring-emerald-700'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 text-xs sm:text-sm">
                        {srv.name}
                      </span>
                      <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm tabular-nums">
                        ₹{srv.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {srv.durationMinutes} mins
                      </span>
                      <span>·</span>
                      <span>{srv.isHomeService ? 'Home Visit Available' : 'Clinic Only'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select Date */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                2. Choose Appointment Date
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {availableDates.map((dateStr) => {
                  const d = new Date(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-w-[68px] py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-medium block opacity-75">
                        {dayName}
                      </span>
                      <span className="text-base font-bold font-mono block mt-0.5">
                        {dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Dynamic Available Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                  3. Select Available Slot
                </label>
                <span className="text-[11px] text-stone-500">
                  {loadingSlots ? 'Checking calendar...' : `${slots.filter((s) => s.isAvailable).length} slots open`}
                </span>
              </div>

              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-stone-500 animate-pulse">
                  Querying practitioner availability...
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-600 border border-stone-200">
                  Practitioner is not scheduling appointments on this day. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime && slot.isAvailable;

                    return (
                      <button
                        key={slot.startTime}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          !slot.isAvailable
                            ? 'bg-stone-100 text-stone-400 border-stone-200 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm font-semibold cursor-pointer'
                            : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 cursor-pointer'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 4: Service Mode & Location */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                4. Service Location
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setServiceMode('HOME_VISIT')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer ${
                    serviceMode === 'HOME_VISIT'
                      ? 'bg-emerald-50/60 border-emerald-700 text-emerald-950 font-semibold'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  <Home className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs">At My Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceMode('PROFESSIONAL_STUDIO')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer ${
                    serviceMode === 'PROFESSIONAL_STUDIO'
                      ? 'bg-emerald-50/60 border-emerald-700 text-emerald-950 font-semibold'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs">Specialist Studio</span>
                </button>
              </div>

              {serviceMode === 'HOME_VISIT' ? (
                <div>
                  <label className="text-[11px] text-stone-500 mb-1 block">
                    Full Address in Delhi NCR:
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat number, Tower, Street, Area, Landmark"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              ) : (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700">
                  <span className="font-semibold block text-stone-900">Specialist Studio Location:</span>
                  <span>{professional.primaryArea}</span>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Precise door number and studio parking instructions are dispatched upon confirmation.
                  </p>
                </div>
              )}
            </div>

            {/* Step 5: Pricing & Payment Method */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-1">
                5. Transparent Payment Summary
              </span>
              <div className="flex justify-between text-xs text-stone-600">
                <span>{selectedService?.name || 'Session'}</span>
                <span className="font-mono text-stone-900 tabular-nums">₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>GST (5%)</span>
                <span className="font-mono text-stone-900 tabular-nums">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Platform Safety & Hygiene Guarantee</span>
                <span className="text-emerald-700 font-semibold">Included</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                <span>Total Payable:</span>
                <span className="font-mono text-base tabular-nums">₹{totalAmount.toLocaleString()}</span>
              </div>

              {/* Payment simulation method */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-stone-500 uppercase block mb-1.5">
                  Payment Method (Simulated Instant Gateway)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Debit Card (HDFC / ICICI / SBI)">Debit / Credit Card (Visa / Mastercard)</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Cash After Service">Cash / UPI After Session</option>
                </select>
              </div>
            </div>

            {/* Confirm CTA */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting || !selectedSlot}
                onClick={handleConfirmBooking}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Securing Time Slot...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{totalAmount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Concurrency Locked · Free cancellation up to 4 hrs before</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
