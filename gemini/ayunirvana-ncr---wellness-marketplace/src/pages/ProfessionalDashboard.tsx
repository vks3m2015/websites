import React, { useState } from 'react';
import { User, ProfessionalProfile, Booking } from '../types';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Phone,
} from 'lucide-react';

interface ProfessionalDashboardProps {
  currentUser: User;
}

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ currentUser }) => {
  const proProfile = api.getProfessionalByUserId(currentUser.id) || api.getProfessionalById('pro-rajeshwar')!;
  const [bookings, setBookings] = useState<Booking[]>(api.getProfessionalBookings(proProfile.id));
  const earnings = api.getProfessionalEarnings(proProfile.id);

  const handleUpdateStatus = (bookingId: string, status: Booking['status']) => {
    try {
      api.updateBookingStatus(bookingId, status, currentUser.id);
      setBookings(api.getProfessionalBookings(proProfile.id));
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={proProfile.avatarUrl}
            alt={proProfile.fullName}
            className="w-16 h-16 rounded-2xl object-cover border border-stone-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {proProfile.fullName}
              </h1>
              {proProfile.verificationStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {proProfile.verificationStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">{proProfile.title}</p>
            <p className="text-xs text-stone-400 mt-1">{proProfile.primaryArea} · {proProfile.yearsExperience} yrs practice</p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
            Rating Score
          </span>
          <p className="font-serif text-2xl font-bold text-stone-900">
            ★ {proProfile.rating.toFixed(1)} <span className="text-xs font-normal text-stone-400">({proProfile.reviewCount} reviews)</span>
          </p>
        </div>
      </div>

      {/* Financial Earnings Overview Cards */}
      <div>
        <h2 className="text-xs uppercase font-semibold text-stone-400 tracking-wider mb-3">
          Earnings & Performance (September 2026)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Net Payout Received</span>
            <p className="font-mono text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
              ₹{earnings.netEarnings.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-400 block mt-1">Direct bank transfer</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Gross Patient Revenue</span>
            <p className="font-mono text-2xl font-bold text-stone-900 mt-1 tabular-nums">
              ₹{earnings.grossRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-400 block mt-1">From {earnings.completedCount} completed appointments</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Platform Safety Fee (10%)</span>
            <p className="font-mono text-2xl font-bold text-stone-600 mt-1 tabular-nums">
              ₹{earnings.platformFees.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-400 block mt-1">Includes gateway & insurance</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Pending In Escrow</span>
            <p className="font-mono text-2xl font-bold text-amber-700 mt-1 tabular-nums">
              ₹{earnings.pendingPayout.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-400 block mt-1">Released upon completion</span>
          </div>
        </div>
      </div>

      {/* Bookings Queue */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Manage Client Appointments
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Review upcoming visits, mark finished sessions, and view customer notes
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-stone-500">
            {bookings.length} Total Bookings
          </span>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-xs text-stone-500 py-8 text-center">
              No bookings received yet. Ensure your profile schedule is open!
            </p>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : b.status === 'COMPLETED'
                          ? 'bg-stone-200 text-stone-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-xs text-stone-400">ID: {b.id}</span>
                  </div>

                  <h3 className="font-semibold text-stone-900 text-sm">
                    {b.serviceName}
                  </h3>
                  <p className="text-xs text-stone-700">
                    Patient: <strong className="text-stone-900">{b.customerName}</strong> ({b.customerPhone})
                  </p>
                  <p className="text-xs text-stone-500">
                    Date & Slot: <strong className="text-stone-800">{b.date}</strong> at <strong className="text-stone-800">{b.startTime} - {b.endTime}</strong> ({b.serviceMode === 'HOME_VISIT' ? 'Home Visit' : 'Studio'})
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Location: {b.address}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Net Earning</span>
                    <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
                      ₹{(b.price - b.platformFee).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'CANCELLED_BY_PROFESSIONAL')}
                          className="px-2.5 py-1.5 bg-stone-200 hover:bg-rose-100 text-stone-700 hover:text-rose-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {b.status === 'COMPLETED' && (
                      <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
