import React, { useState } from 'react';
import { api } from '../services/api';
import { DELHI_NCR_AREAS } from '../data/locations';
import { SERVICE_CATEGORIES } from '../data/categories';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react';

interface OnboardingProPageProps {
  onCompleted: () => void;
}

export const OnboardingProPage: React.FC<OnboardingProPageProps> = ({ onCompleted }) => {
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Professional Details
  const [title, setTitle] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [yearsExperience, setYearsExperience] = useState<number>(6);
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string>('English, Hindi');
  const [primaryArea, setPrimaryArea] = useState<string>('Hauz Khas, South Delhi');
  const [qualifications, setQualifications] = useState<string>('BAMS - Delhi University, AYUSH Lic: DL/7721');

  // Step 3: Services
  const [services, setServices] = useState<
    { name: string; categoryId: string; description: string; durationMinutes: number; price: number; isHomeService: boolean }[]
  >([
    {
      name: 'Custom Ayurvedic Healing Consultation & Therapy',
      categoryId: 'cat-ayurveda',
      description: 'Comprehensive pulse diagnostics (Nadi Pariksha) and individualized herbal oil massage.',
      durationMinutes: 60,
      price: 1500,
      isHomeService: true,
    },
  ]);

  // Step 4: Verification docs
  const [docNumber, setDocNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const addService = () => {
    setServices([
      ...services,
      {
        name: '',
        categoryId: 'cat-ayurveda',
        description: '',
        durationMinutes: 60,
        price: 1200,
        isHomeService: true,
      },
    ]);
  };

  const removeService = (idx: number) => {
    if (services.length === 1) return;
    setServices(services.filter((_, i) => i !== idx));
  };

  const updateService = (idx: number, field: string, value: any) => {
    const copy = [...services];
    (copy[idx] as any)[field] = value;
    setServices(copy);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must accept the AyuNirvana Professional Code of Conduct.');
      return;
    }

    try {
      const selectedLocationObj = DELHI_NCR_AREAS.find((a) => a.name.includes(primaryArea)) || DELHI_NCR_AREAS[0];

      api.registerProfessional(
        { fullName, email, phone },
        {
          title,
          gender,
          yearsExperience,
          bio,
          languages: languages.split(',').map((l) => l.trim()),
          qualifications: qualifications.split(',').map((q) => q.trim()),
          primaryArea,
          serviceAreas: [primaryArea, 'Greater Kailash', 'Saket', 'Noida Sec 18'],
          coordinates: selectedLocationObj.coordinates,
          serviceRadiusKm: 15,
          avatarUrl: '/src/assets/images/therapist_ayurveda_expert_1790407820535.jpg',
        },
        services.map((s) => ({
          name: s.name,
          categoryId: s.categoryId,
          description: s.description,
          durationMinutes: s.durationMinutes,
          price: s.price,
          isHomeService: s.isHomeService,
          isCenterService: true,
        }))
      );

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 sm:p-10">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Application Under Compliance Review
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-stone-900">{fullName}</strong>. Your profile has been created with status <span className="font-mono text-emerald-800 font-bold">UNDER_REVIEW</span>.
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Our administrative compliance team verifies medical council documents within 1 business day before making your profile publicly searchable.
            </p>
            <button
              onClick={onCompleted}
              className="mt-4 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Open Specialist Portal
            </button>
          </div>
        ) : (
          <div>
            {/* Stepper indicator */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
                  Step {step} of 4
                </span>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  {step === 1 && 'Practitioner Account'}
                  {step === 2 && 'Qualifications & Bio'}
                  {step === 3 && 'Therapies & Pricing'}
                  {step === 4 && 'Verification & Safety Pledge'}
                </h1>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`w-6 h-1.5 rounded-full ${
                      step >= s ? 'bg-emerald-700' : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Kavita Deshmukh, BAMS"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kavita@wellness.in"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Delhi NCR)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98110 54321"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName || !email) {
                        setError('Please provide your name and email.');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Professional Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Ayurvedic Physician & Panchakarma Specialist"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Years of Practice</label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Delhi NCR Hub</label>
                    <select
                      value={primaryArea}
                      onChange={(e) => setPrimaryArea(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      {DELHI_NCR_AREAS.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Degrees & Council Registrations</label>
                  <input
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. BAMS, MD (Ayurveda), AYUSH Council Reg: 1290"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Practice Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your training, treatment style, and areas of specialization..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!title) {
                        setError('Please provide your professional title.');
                        return;
                      }
                      setError(null);
                      setStep(3);
                    }}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Add Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-500">
                    Define the therapeutic services you offer with transparent pricing in INR (₹).
                  </p>
                  <button
                    type="button"
                    onClick={addService}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Service
                  </button>
                </div>

                <div className="space-y-4">
                  {services.map((srv, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative">
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={srv.name}
                          onChange={(e) => updateService(idx, 'name', e.target.value)}
                          placeholder="e.g. Sarvanga Abhyanga Full Body Therapy"
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">Discipline</label>
                          <select
                            value={srv.categoryId}
                            onChange={(e) => updateService(idx, 'categoryId', e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                          >
                            {SERVICE_CATEGORIES.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">Duration (Mins)</label>
                          <input
                            type="number"
                            value={srv.durationMinutes}
                            onChange={(e) => updateService(idx, 'durationMinutes', Number(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={srv.price}
                            onChange={(e) => updateService(idx, 'price', Number(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Therapy Description</label>
                        <textarea
                          rows={2}
                          value={srv.description}
                          onChange={(e) => updateService(idx, 'description', e.target.value)}
                          placeholder="What oils/methods are used, and what benefits does the client experience?"
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (services.some((s) => !s.name)) {
                        setError('Please name each service you have listed.');
                        return;
                      }
                      setError(null);
                      setStep(4);
                    }}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Compliance & Submit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Verification & Safety */}
            {step === 4 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span>AyuNirvana Professional Code of Conduct</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    AyuNirvana strictly operates as a certified healthcare and wellness marketplace. Explicit, non-therapeutic, or adult service solicitations are legally prohibited and lead to permanent blacklisting and legal reporting to Delhi NCR authorities.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State Council / Medical Registration Number
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. Delhi Bharatiya Chikitsa Parishad: DBCP/2019/8812"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Our compliance team cross-checks this against the state registry.
                  </p>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span className="text-xs text-stone-700 leading-relaxed">
                      I solemnly affirm that my qualifications are authentic, that I offer strictly therapeutic wellness services, and that I agree to AyuNirvana's safety standards and platform fee terms (10%).
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Profile For Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
