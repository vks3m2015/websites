import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  reportedEntityId: string;
  reportedEntityType: 'PROFESSIONAL' | 'CUSTOMER' | 'REVIEW' | 'IMAGE';
  reporterUserId: string;
  entityName: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportedEntityId,
  reportedEntityType,
  reporterUserId,
  entityName,
  onClose,
}) => {
  const [reason, setReason] = useState<string>('Unprofessional conduct / Misleading profile');
  const [description, setDescription] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide specific details for the moderation team.');
      return;
    }

    try {
      api.submitReport({
        reporterUserId,
        reportedEntityId,
        reportedEntityType,
        reason,
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError('Failed to record report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Content & Safety Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-stone-900">
              Report Filed to AyuNirvana Safety Desk
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Our Delhi NCR moderation compliance team reviews all reports within 4 hours. Thank you for maintaining marketplace safety.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs text-stone-600">
              Reporting: <span className="font-bold text-stone-900">{entityName}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason for report:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="Unprofessional conduct / Misleading profile">Unprofessional conduct / Misleading profile</option>
                <option value="Non-wellness solicitation violation">Non-wellness or adult solicitation violation</option>
                <option value="Unverified credential / Fake clinic address">Unverified credential / Fake clinic address</option>
                <option value="Hygiene or sanitation issue">Hygiene or sanitation issue</option>
                <option value="Spam or fraudulent booking">Spam or fraudulent booking</option>
                <option value="Other">Other policy violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Description & evidence:
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what occurred in detail..."
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
                className="w-full py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
