import React, { useState } from 'react';
import { Booking, User, Review } from '../types';
import { api } from '../services/api';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking;
  currentUser: User;
  onClose: () => void;
  onSuccess: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please share a few words about your therapy experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const review = api.submitReview({
        bookingId: booking.id,
        customerId: currentUser.id,
        rating,
        comment: comment.trim(),
      });
      onSuccess(review);
    } catch (err: any) {
      setError(err.message || 'Unable to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
              Verified Experience
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Review Appointment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
            <p className="font-semibold text-stone-900">{booking.serviceName}</p>
            <p className="text-stone-500">with {booking.professionalName}</p>
            <p className="text-stone-400 text-[11px]">Completed on {booking.date}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Your Rating:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-stone-300 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono text-xs font-bold text-stone-700">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Feedback & Comments:
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the practitioner's technique, punctuality, and hygiene?"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Posting...' : 'Submit Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
