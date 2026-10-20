import React, { useState } from 'react';
import { User, ProfessionalProfile, ContentReport, Review, AuditLog } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Ban,
  Search,
  Eye,
  Sliders,
  History,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { runAutomatedTests, TestResult } from '../server/tests';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState<'METRICS' | 'VERIFICATIONS' | 'USERS' | 'REPORTS' | 'REVIEWS' | 'AUDIT' | 'TESTS' | 'CONFIG'>('METRICS');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [savedConfigMessage, setSavedConfigMessage] = useState<string | null>(null);

  // Editable placeholder settings
  const [configValues, setConfigValues] = useState({
    databaseUrl: 'postgresql://YOUR_DATABASE_USERNAME:YOUR_DATABASE_PASSWORD@YOUR_DATABASE_HOST:5432/YOUR_DATABASE_NAME?sslmode=require',
    jwtSecret: 'YOUR_JWT_SECRET_KEY',
    storageBucket: 'YOUR_STORAGE_BUCKET_NAME',
    storageAccessKey: 'YOUR_STORAGE_ACCESS_KEY',
    storageSecretKey: 'YOUR_STORAGE_SECRET_KEY',
    paymentApiKey: 'YOUR_PAYMENT_GATEWAY_API_KEY',
    paymentWebhookSecret: 'YOUR_PAYMENT_WEBHOOK_SECRET',
    smsApiKey: 'YOUR_SMS_GATEWAY_API_KEY',
    mapsApiKey: 'YOUR_MAPS_API_KEY',
    platformFeePercent: '10',
    taxGstPercent: '5',
    minCancellationHours: '4',
  });

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const res = runAutomatedTests();
      setTestResults(res);
      setIsRunningTests(false);
    }, 250);
  };

  const metrics = api.getAdminMetrics();
  const [pros, setPros] = useState<ProfessionalProfile[]>(api.getAllProfessionalsAdmin());
  const [users, setUsers] = useState<User[]>(api.getAllUsers());
  const [reports, setReports] = useState<ContentReport[]>(api.getAllReportsAdmin());
  const [reviews, setReviews] = useState<Review[]>(api.getAllReviewsAdmin());
  const [auditLogs] = useState<AuditLog[]>(api.getAuditLogs());

  const pendingPros = pros.filter(
    (p) => p.verificationStatus === 'UNDER_REVIEW' || p.verificationStatus === 'SUBMITTED'
  );

  const handleVerificationAction = (proId: string, status: ProfessionalProfile['verificationStatus']) => {
    const notes = prompt(`Enter verification review notes for status [${status}]:`, 'Council credentials and identity confirmed.') || '';
    try {
      api.updateProfessionalVerification(proId, status, notes, currentUser.id);
      setPros(api.getAllProfessionalsAdmin());
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleUserSuspension = (userId: string, currentSuspended: boolean) => {
    try {
      api.toggleUserSuspension(userId, !currentSuspended, currentUser.id);
      setUsers(api.getAllUsers());
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleResolveReport = (reportId: string, status: ContentReport['status']) => {
    const notes = prompt('Enter resolution notes:', 'Investigated and closed.') || '';
    try {
      api.resolveReport(reportId, status, notes, currentUser.id);
      setReports(api.getAllReportsAdmin());
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleModerateReview = (reviewId: string, isApproved: boolean) => {
    try {
      api.moderateReview(reviewId, isApproved, currentUser.id);
      setReviews(api.getAllReviewsAdmin());
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-800">
            Platform Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
            AyuNirvana Control Console
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            SuperAdmin role: Verification workflows, content moderation & compliance audit
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveSection('METRICS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'METRICS' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('VERIFICATIONS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer relative ${
              activeSection === 'VERIFICATIONS' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            Verifications
            {pendingPros.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px]">
                {pendingPros.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('USERS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'USERS' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveSection('REPORTS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'REPORTS' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveSection('REVIEWS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'REVIEWS' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSection('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'AUDIT' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            Audit Log
          </button>
          <button
            onClick={() => {
              setActiveSection('TESTS');
              if (testResults.length === 0) handleRunTests();
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'TESTS' ? 'bg-emerald-800 text-white shadow-xs font-semibold' : 'text-emerald-800 bg-emerald-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Automated Tests</span>
          </button>
          <button
            onClick={() => setActiveSection('CONFIG')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'CONFIG' ? 'bg-stone-900 text-white shadow-xs font-semibold' : 'text-stone-600'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Environment Config</span>
          </button>
        </div>
      </div>

      {/* Section: Metrics & Platform Analytics */}
      {activeSection === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Gross Platform Volume</span>
              <p className="font-mono text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                ₹{metrics.grossRevenue.toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-400 block mt-1">Total customer booking spend</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Platform Fee Revenue (10%)</span>
              <p className="font-mono text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
                ₹{metrics.platformEarnings.toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-400 block mt-1">Net platform monetization</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Total Bookings Completed</span>
              <p className="font-mono text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                {metrics.completedBookings} / {metrics.totalBookings}
              </p>
              <span className="text-[11px] text-stone-400 block mt-1">Cancellation rate: {Math.round((metrics.cancelledBookings / Math.max(1, metrics.totalBookings)) * 100)}%</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-medium">Specialists in Delhi NCR</span>
              <p className="font-mono text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                {metrics.verifiedPros} <span className="text-xs text-amber-700 font-normal">({metrics.pendingPros} pending)</span>
              </p>
              <span className="text-[11px] text-stone-400 block mt-1">Across 18 Delhi NCR districts</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Delhi NCR Micro-Market Coverage Status
            </h3>
            <p className="text-xs text-stone-600">
              Active verified capacity distributed across South Delhi (Hauz Khas, GK), Gurugram Cyber Hub, Golf Course Road, Noida Sector 62 & 137 Expressway, NIT Faridabad, and Indirapuram.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-stone-600">
              <span className="px-3 py-1 bg-stone-100 rounded-lg">South Delhi: 4 Specialists</span>
              <span className="px-3 py-1 bg-stone-100 rounded-lg">Gurugram: 4 Specialists</span>
              <span className="px-3 py-1 bg-stone-100 rounded-lg">Noida & Gr. Noida: 4 Specialists</span>
              <span className="px-3 py-1 bg-stone-100 rounded-lg">Faridabad: 2 Specialists</span>
              <span className="px-3 py-1 bg-stone-100 rounded-lg">Ghaziabad: 1 Specialist</span>
            </div>
          </div>
        </div>
      )}

      {/* Section: Professional Verifications */}
      {activeSection === 'VERIFICATIONS' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Specialist Verification Queue
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Review submitted medical degrees, AYUSH registrations, and background details
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {pros.map((p) => (
              <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-stone-900 text-sm">{p.fullName}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : p.verificationStatus === 'UNDER_REVIEW'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {p.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{p.title} · {p.primaryArea}</p>
                  <p className="text-xs text-stone-500">
                    Qualifications: <strong className="text-stone-700">{p.qualifications.join('; ')}</strong>
                  </p>
                  {p.verificationNotes && (
                    <p className="text-[11px] text-stone-400 italic">Notes: {p.verificationNotes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {p.verificationStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => handleVerificationAction(p.id, 'VERIFIED')}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Approve & Verify
                    </button>
                  )}
                  {p.verificationStatus !== 'SUSPENDED' && (
                    <button
                      onClick={() => handleVerificationAction(p.id, 'SUSPENDED')}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Suspend
                    </button>
                  )}
                  {p.verificationStatus === 'SUSPENDED' && (
                    <button
                      onClick={() => handleVerificationAction(p.id, 'VERIFIED')}
                      className="px-3 py-1.5 bg-stone-900 text-white font-semibold text-xs rounded-xl"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: User Accounts */}
      {activeSection === 'USERS' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900">Registered Users</h2>
          <div className="divide-y divide-stone-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{u.fullName}</span>
                    <span className="text-[10px] uppercase font-bold text-stone-400">[{u.role}]</span>
                    {u.isSuspended && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.2 rounded">
                        SUSPENDED
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500">{u.email} · {u.phone}</p>
                </div>

                {u.role !== 'ADMIN' && (
                  <button
                    onClick={() => handleToggleUserSuspension(u.id, u.isSuspended)}
                    className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                      u.isSuspended
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    {u.isSuspended ? 'Reactivate User' : 'Suspend Account'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Reports */}
      {activeSection === 'REPORTS' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900">Safety & Content Reports</h2>
          <div className="divide-y divide-stone-100">
            {reports.map((r) => (
              <div key={r.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                      {r.reason}
                    </span>
                    <span className="text-xs text-stone-400 ml-2">Status: {r.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-800 text-white rounded-lg"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                      className="px-2.5 py-1 text-xs font-semibold bg-stone-100 text-stone-600 rounded-lg"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-700">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Reviews Moderation */}
      {activeSection === 'REVIEWS' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900">Customer Review Moderation</h2>
          <div className="divide-y divide-stone-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{rev.customerName}</span>
                    <span className="text-amber-500 font-bold">★ {rev.rating}</span>
                    <span className="text-[10px] text-stone-400">for Pro ID: {rev.professionalId}</span>
                  </div>
                  <p className="text-stone-600">{rev.comment}</p>
                </div>
                <button
                  onClick={() => handleModerateReview(rev.id, !rev.isApproved)}
                  className={`px-3 py-1 rounded-lg font-semibold cursor-pointer shrink-0 ${
                    rev.isApproved
                      ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {rev.isApproved ? 'Hide Review' : 'Restore Review'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Audit Logs */}
      {activeSection === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900">Platform Audit Trail</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-800">[{log.action}]</span>{' '}
                  <span className="text-stone-800">{log.details}</span>
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap ml-4">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Automated Concurrency & Reliability Tests */}
      {activeSection === 'TESTS' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Automated Concurrency & Reliability Test Suite
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Proves concurrency slot collision locks, payment idempotency, unverified profile blocks, and Haversine geospatial precision.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{isRunningTests ? 'Executing Test Runner...' : 'Re-Run Automated Tests'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  t.passed
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    )}
                    <span className="font-bold text-xs">{t.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-stone-500 font-semibold tabular-nums">
                    {t.durationMs} ms
                  </span>
                </div>
                <p className="text-xs text-stone-700 mt-1 pl-6 leading-relaxed">
                  {t.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Environment & Secrets Configuration (Placeholders) */}
      {activeSection === 'CONFIG' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Environment Configuration & Integration Placeholders
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Placeholders configured for your database, cloud storage, payment gateway, and SMS route. You can populate real values whenever you are ready.
              </p>
            </div>
            <button
              onClick={() => {
                setSavedConfigMessage('Placeholder configuration updated successfully.');
                setTimeout(() => setSavedConfigMessage(null), 3000);
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Save Configuration
            </button>
          </div>

          {savedConfigMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{savedConfigMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Database & Security */}
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50/60 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                1. Database & Authentication
              </h3>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  DATABASE_URL (PostgreSQL + PostGIS)
                </label>
                <input
                  type="text"
                  value={configValues.databaseUrl}
                  onChange={(e) => setConfigValues({ ...configValues, databaseUrl: e.target.value })}
                  placeholder="postgresql://username:password@host:5432/dbname"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  JWT_SECRET
                </label>
                <input
                  type="text"
                  value={configValues.jwtSecret}
                  onChange={(e) => setConfigValues({ ...configValues, jwtSecret: e.target.value })}
                  placeholder="YOUR_JWT_SECRET_KEY"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Cloud Object Storage */}
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50/60 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                2. Object Storage (R2 / S3 / GCS)
              </h3>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  STORAGE_BUCKET
                </label>
                <input
                  type="text"
                  value={configValues.storageBucket}
                  onChange={(e) => setConfigValues({ ...configValues, storageBucket: e.target.value })}
                  placeholder="YOUR_STORAGE_BUCKET_NAME"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    STORAGE_ACCESS_KEY
                  </label>
                  <input
                    type="text"
                    value={configValues.storageAccessKey}
                    onChange={(e) => setConfigValues({ ...configValues, storageAccessKey: e.target.value })}
                    placeholder="YOUR_ACCESS_KEY"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    STORAGE_SECRET_KEY
                  </label>
                  <input
                    type="password"
                    value={configValues.storageSecretKey}
                    onChange={(e) => setConfigValues({ ...configValues, storageSecretKey: e.target.value })}
                    placeholder="YOUR_SECRET_KEY"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Payment Gateway */}
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50/60 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                3. Payment Gateway (Razorpay / UPI)
              </h3>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  PAYMENT_API_KEY
                </label>
                <input
                  type="text"
                  value={configValues.paymentApiKey}
                  onChange={(e) => setConfigValues({ ...configValues, paymentApiKey: e.target.value })}
                  placeholder="YOUR_PAYMENT_GATEWAY_API_KEY"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  PAYMENT_WEBHOOK_SECRET
                </label>
                <input
                  type="password"
                  value={configValues.paymentWebhookSecret}
                  onChange={(e) => setConfigValues({ ...configValues, paymentWebhookSecret: e.target.value })}
                  placeholder="YOUR_PAYMENT_WEBHOOK_SECRET"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Communication & Maps */}
            <div className="space-y-4 p-5 rounded-2xl bg-stone-50/60 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                4. Gateways & Business Rules
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    SMS_GATEWAY_KEY
                  </label>
                  <input
                    type="text"
                    value={configValues.smsApiKey}
                    onChange={(e) => setConfigValues({ ...configValues, smsApiKey: e.target.value })}
                    placeholder="YOUR_SMS_API_KEY"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    MAPS_API_KEY
                  </label>
                  <input
                    type="text"
                    value={configValues.mapsApiKey}
                    onChange={(e) => setConfigValues({ ...configValues, mapsApiKey: e.target.value })}
                    placeholder="YOUR_MAPS_KEY"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Platform Fee (%)
                  </label>
                  <input
                    type="number"
                    value={configValues.platformFeePercent}
                    onChange={(e) => setConfigValues({ ...configValues, platformFeePercent: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-center font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    value={configValues.taxGstPercent}
                    onChange={(e) => setConfigValues({ ...configValues, taxGstPercent: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-center font-bold text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Cancel Hours
                  </label>
                  <input
                    type="number"
                    value={configValues.minCancellationHours}
                    onChange={(e) => setConfigValues({ ...configValues, minCancellationHours: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-center font-bold text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
