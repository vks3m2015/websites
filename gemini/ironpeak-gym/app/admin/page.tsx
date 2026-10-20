'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../../components/ThemeToggle';

type Settings = {
  id?: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  hero_image: string;
};

type Member = {
  id: string;
  name: string;
  mobile: string;
  join_date: string;
  plan_name: string;
  plan_expiry: string;
  amount_paid: number | string;
  payment_date: string;
  notes: string;
};

type Visitor = {
  id: string;
  name: string;
  mobile: string;
  visit_date: string;
  purpose: string;
  follow_up_date: string | null;
  notes: string;
};

type Trainer = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  sort_order?: number;
};

type MembershipPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  sort_order?: number;
};

type OpeningHour = {
  id: string;
  day: string;
  opens: string;
  closes: string;
  sort_order?: number;
};

type GenericItem = {
  id: string;
  title: string;
  description?: string;
  sort_order?: number;
};

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string;
  sort_order?: number;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeUrgent?: boolean;
};

const emptySettings: Settings = {
  name: 'Iron Peak',
  description: '',
  phone: '',
  email: '',
  address: '',
  hero_image: '',
};

const today = () => new Date().toISOString().slice(0, 10);

const afterDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const dateLabel = (value: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
};

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const getDaysRemaining = (expiryDate: string) => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const diffTime = expiry.getTime() - todayDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function Admin() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [notice, setNotice] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Main data states
  const [members, setMembers] = useState<Member[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [equipment, setEquipment] = useState<GenericItem[]>([]);
  const [services, setServices] = useState<GenericItem[]>([]);
  const [facilities, setFacilities] = useState<GenericItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  // Navigation & UI states
  const [activeSection, setActiveSection] = useState('active-members');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [visitorSearch, setVisitorSearch] = useState('');

  const loadAllData = async () => {
    if (!supabase) return;
    const client = supabase;

    const [
      settingsRes,
      memberRes,
      visitorRes,
      trainersRes,
      plansRes,
      hoursRes,
      equipmentRes,
      servicesRes,
      facilitiesRes,
      galleryRes,
    ] = await Promise.all([
      client.from('gym_settings').select('*').single(),
      client.from('members').select('*').order('plan_expiry'),
      client.from('visitors').select('*').order('visit_date', { ascending: false }),
      client.from('trainers').select('*').order('sort_order'),
      client.from('membership_plans').select('*').order('sort_order'),
      client.from('opening_hours').select('*').order('sort_order'),
      client.from('gym_equipment').select('*').order('sort_order'),
      client.from('services').select('*').order('sort_order'),
      client.from('facilities').select('*').order('sort_order'),
      client.from('gallery_images').select('*').order('sort_order'),
    ]);

    if (settingsRes.data) setSettings(settingsRes.data);
    setMembers((memberRes.data as Member[]) || []);
    setVisitors((visitorRes.data as Visitor[]) || []);
    setTrainers((trainersRes.data as Trainer[]) || []);
    setPlans((plansRes.data as MembershipPlan[]) || []);
    setHours((hoursRes.data as OpeningHour[]) || []);
    setEquipment((equipmentRes.data as GenericItem[]) || []);
    setServices((servicesRes.data as GenericItem[]) || []);
    setFacilities((facilitiesRes.data as GenericItem[]) || []);
    setGallery((galleryRes.data as GalleryImage[]) || []);
  };

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const signedIn = !!data.session;
      setLoggedIn(signedIn);
      if (signedIn) {
        loadAllData();
      }
    });

    supabase
      .from('gym_settings')
      .select('*')
      .single()
      .then(({ data }) => data && setSettings(data));
  }, []);

  // ScrollSpy to track active section
  useEffect(() => {
    if (!loggedIn) return;

    const sectionIds = [
      'active-members',
      'visitors',
      'expiring-soon',
      'trainers',
      'membership-plans',
      'opening-hours',
      'gym-details',
      'gym-equipments',
      'services',
      'facilities-gallery',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loggedIn]);

  const summary = useMemo(() => {
    const now = today();
    const week = afterDays(7);
    const month = now.slice(0, 7);

    const active = members.filter((member) => member.plan_expiry >= now);
    const expiring = active.filter((member) => member.plan_expiry <= week);
    const earnings = members
      .filter((member) => member.payment_date.startsWith(month))
      .reduce((sum, member) => sum + Number(member.amount_paid || 0), 0);

    return { active, expiring, earnings };
  }, [members]);

  const filteredActiveMembers = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return summary.active;
    return summary.active.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.plan_name.toLowerCase().includes(q)
    );
  }, [summary.active, memberSearch]);

  const filteredVisitors = useMemo(() => {
    const q = visitorSearch.toLowerCase().trim();
    if (!q) return visitors;
    return visitors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.mobile.includes(q) ||
        v.purpose.toLowerCase().includes(q) ||
        (v.notes && v.notes.toLowerCase().includes(q))
    );
  }, [visitors, visitorSearch]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof window !== 'undefined' && window.history.pushState) {
        window.history.pushState(null, '', `#${id}`);
      }
    }
    setIsMobileNavOpen(false);
  };

  // Unified side navigation items list
  const navItems: NavItem[] = useMemo(
    () => [
      {
        id: 'active-members',
        label: 'Active Members',
        icon: <IconUsers />,
        badge: summary.active.length,
      },
      {
        id: 'visitors',
        label: 'Visitors',
        icon: <IconVisitor />,
        badge: visitors.length,
      },
      {
        id: 'expiring-soon',
        label: 'Plan Expiring Soon',
        icon: <IconAlert />,
        badge: summary.expiring.length,
        badgeUrgent: summary.expiring.length > 0,
      },
      {
        id: 'trainers',
        label: 'Trainers',
        icon: <IconCoach />,
        badge: trainers.length,
      },
      {
        id: 'membership-plans',
        label: 'Membership Plans',
        icon: <IconCreditCard />,
        badge: plans.length,
      },
      {
        id: 'opening-hours',
        label: 'Opening Hours',
        icon: <IconClock />,
        badge: hours.length,
      },
      {
        id: 'gym-details',
        label: 'Gym Details',
        icon: <IconBuilding />,
      },
      {
        id: 'gym-equipments',
        label: 'Gym Equipments',
        icon: <IconDumbbell />,
        badge: equipment.length,
      },
      {
        id: 'services',
        label: 'Services',
        icon: <IconZap />,
        badge: services.length,
      },
      {
        id: 'facilities-gallery',
        label: 'Facilities & Gallery',
        icon: <IconGrid />,
      },
    ],
    [
      summary.active.length,
      summary.expiring.length,
      visitors.length,
      trainers.length,
      plans.length,
      hours.length,
      equipment.length,
      services.length,
    ]
  );

  if (!supabase) {
    return (
      <main className="admin-shell grid place-items-center p-6">
        <div className="admin-card max-w-lg p-8">
          <p className="eyebrow">Setup needed</p>
          <h1 className="display mt-3 text-4xl">CONNECT SUPABASE.</h1>
          <p className="mt-5 leading-relaxed opacity-80">
            Copy <code>.env.local.example</code> to <code>.env.local</code>, add
            your project URL and anonymous key, then restart the site.
          </p>
          <a href="/" className="mt-7 inline-block text-lime font-bold">
            ← Back to site
          </a>
        </div>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="admin-shell grid place-items-center p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <ThemeToggle showLabel />
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!supabase) return;

              const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (error) {
                setNotice(error.message);
              } else {
                setLoggedIn(true);
                loadAllData();
              }
            }}
            className="admin-card w-full p-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="brand-mark">✦</span>
              <span className="eyebrow">Iron Peak Admin</span>
            </div>
            <h1 className="display mt-1 text-4xl">WELCOME BACK.</h1>
            <p className="mt-2 text-xs opacity-75">
              Sign in with your owner credentials to manage the gym.
            </p>

            <div className="mt-8 space-y-4">
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                required
              />
            </div>

            {notice && <p className="mt-3 text-sm text-red-500 font-medium">{notice}</p>}

            <button className="mt-6 w-full rounded-lg bg-lime py-3 font-bold text-ink hover:opacity-90 transition">
              Log in to console
            </button>

            <a
              href="/"
              className="mt-5 block text-center text-sm opacity-70 hover:text-lime transition"
            >
              ← Back to public site
            </a>
          </form>
        </div>
      </main>
    );
  }

  async function saveGymSettings(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    const { error } = await supabase.from('gym_settings').upsert({
      ...settings,
      id: settings.id || '00000000-0000-0000-0000-000000000001',
    });

    setNotice(
      error
        ? error.message
        : 'Gym details saved — public site updated successfully.'
    );
  }

  return (
    <div className="admin-shell">
      {/* ===================== UNIFIED SIDE NAVIGATION BAR (DESKTOP) ===================== */}
      <aside className="admin-sidebar hidden lg:flex fixed inset-y-0 left-0 w-64 xl:w-72 flex-col border-r z-30">
        <UnifiedSideNavContent
          navItems={navItems}
          activeSection={activeSection}
          onSelectSection={scrollTo}
          onSignOut={() => {
            if (!supabase) return;
            supabase.auth.signOut().then(() => setLoggedIn(false));
          }}
        />
      </aside>

      {/* ===================== MOBILE TOP BAR ===================== */}
      <header className="admin-header lg:hidden sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="brand-mark text-xs w-6 h-6">✦</span>
          <b className="tracking-tight text-sm">IRON PEAK</b>
          <span className="text-[10px] text-lime font-mono">/ OWNER</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="rounded-lg border admin-table-border p-2 opacity-80 hover:opacity-100"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
          <div className="admin-sidebar fixed inset-y-0 left-0 w-72 border-r p-0 flex flex-col justify-between overflow-y-auto">
            <UnifiedSideNavContent
              navItems={navItems}
              activeSection={activeSection}
              onSelectSection={scrollTo}
              onCloseMobile={() => setIsMobileNavOpen(false)}
              onSignOut={() => {
                if (!supabase) return;
                supabase.auth.signOut().then(() => setLoggedIn(false));
              }}
            />
          </div>
        </div>
      )}

      {/* ===================== MAIN CONTENT CANVAS ===================== */}
      <main className="lg:pl-64 xl:pl-72 min-h-screen">
        {/* Top Header */}
        <div className="admin-header border-b px-6 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Owner Dashboard</p>
            <h1 className="display text-3xl sm:text-4xl">RUN THE FLOOR.</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs opacity-75">
              Welcome, <span className="font-semibold">{email || 'Gym Owner'}</span>
            </span>
            <ThemeToggle showLabel />
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border admin-table-border px-3 py-1.5 text-xs font-semibold opacity-80 hover:opacity-100 hover:border-lime transition"
            >
              Public Site ↗
            </a>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-8 space-y-10 max-w-7xl">
          {/* Notification Toast Banner */}
          {notice && (
            <div className="flex items-center justify-between rounded-xl border border-lime/40 bg-lime/10 p-4 text-sm text-lime">
              <span>{notice}</span>
              <button
                onClick={() => setNotice('')}
                className="text-xs font-bold text-lime hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Active members"
              value={String(summary.active.length)}
              detail="Plans currently active"
              onClick={() => scrollTo('active-members')}
            />
            <Stat
              label="Expiring soon"
              value={String(summary.expiring.length)}
              detail="Due in next 7 days"
              highlight={summary.expiring.length > 0}
              onClick={() => scrollTo('expiring-soon')}
            />
            <Stat
              label="Visitors registered"
              value={String(visitors.length)}
              detail="Walk-ins & inquiries"
              onClick={() => scrollTo('visitors')}
            />
            <Stat
              label="Revenue this month"
              value={money(summary.earnings)}
              detail="Recorded member dues"
            />
          </section>

          {/* ================= SECTION 1: ACTIVE MEMBERS ================= */}
          <section id="active-members" className="scroll-mt-6 admin-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b admin-table-border p-6">
              <div>
                <p className="eyebrow">Members</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Active Members</h2>
                  <span className="rounded-full bg-lime/20 px-2.5 py-0.5 text-xs font-semibold text-lime">
                    {filteredActiveMembers.length} active
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-75">
                  Current members with valid subscriptions
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="admin-input !w-44 sm:!w-60 !py-2 !px-3 !text-xs rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowAddMember((prev) => !prev)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                    showAddMember
                      ? 'admin-tag opacity-90'
                      : 'bg-lime text-ink hover:opacity-90'
                  }`}
                >
                  {showAddMember ? '✕ Close Form' : '+ Add Member'}
                </button>
              </div>
            </div>

            {/* "Add Member option on top of Active Member List table" */}
            {showAddMember && (
              <div className="border-b admin-card-inner p-6 animate-fadeIn">
                <MemberForm
                  onSaved={async () => {
                    await loadAllData();
                    setShowAddMember(false);
                    setNotice('New member added successfully.');
                  }}
                  onCancel={() => setShowAddMember(false)}
                />
              </div>
            )}

            {/* Active Members Table */}
            {filteredActiveMembers.length === 0 ? (
              <div className="p-8 text-center text-sm opacity-70">
                {memberSearch
                  ? `No active members matching "${memberSearch}".`
                  : 'No active members registered yet. Click "+ Add Member" above to record the first one.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="admin-table-head text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Member</th>
                      <th className="px-4 py-3.5">Plan</th>
                      <th className="px-4 py-3.5">Joined</th>
                      <th className="px-4 py-3.5">Expires</th>
                      <th className="px-4 py-3.5">Paid</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y admin-table-border">
                    {filteredActiveMembers.map((member) => {
                      const daysLeft = getDaysRemaining(member.plan_expiry);
                      return (
                        <tr key={member.id} className="admin-table-row transition">
                          <td className="px-6 py-4">
                            <b className="block">{member.name}</b>
                            <span className="text-xs opacity-70 font-mono">
                              {member.mobile}
                            </span>
                            {member.notes && (
                              <p className="text-[11px] opacity-70 mt-0.5 line-clamp-1 italic">
                                Note: {member.notes}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="admin-tag inline-block rounded-md px-2.5 py-1 text-xs font-semibold">
                              {member.plan_name}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs opacity-70">
                            {dateLabel(member.join_date)}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs font-medium block">
                              {dateLabel(member.plan_expiry)}
                            </span>
                            <span
                              className={`text-[10px] font-mono ${
                                daysLeft <= 7
                                  ? 'text-lime font-bold'
                                  : 'opacity-70'
                              }`}
                            >
                              {daysLeft === 0
                                ? 'Expires today'
                                : daysLeft === 1
                                ? 'Expires tomorrow'
                                : `${daysLeft} days left`}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs">
                            {money(Number(member.amount_paid || 0))}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Remove record for ${member.name}?`))
                                  return;
                                await supabase
                                  ?.from('members')
                                  .delete()
                                  .eq('id', member.id);
                                await loadAllData();
                                setNotice('Member record removed.');
                              }}
                              className="text-xs text-red-500 hover:underline transition"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ================= SECTION 2: VISITORS ================= */}
          <section id="visitors" className="scroll-mt-6 admin-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b admin-table-border p-6">
              <div>
                <p className="eyebrow">Walk-in register</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Visitors</h2>
                  <span className="admin-tag rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {filteredVisitors.length} recorded
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-75">
                  Track walk-ins, gym enquiries, and prospective members
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search visitors..."
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  className="admin-input !w-44 sm:!w-60 !py-2 !px-3 !text-xs rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowAddVisitor((prev) => !prev)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                    showAddVisitor
                      ? 'admin-tag opacity-90'
                      : 'bg-lime text-ink hover:opacity-90'
                  }`}
                >
                  {showAddVisitor ? '✕ Close Form' : '+ Add Visitor'}
                </button>
              </div>
            </div>

            {/* "Add Visitor option on top of Visitors List table" */}
            {showAddVisitor && (
              <div className="border-b admin-card-inner p-6 animate-fadeIn">
                <VisitorForm
                  onSaved={async () => {
                    await loadAllData();
                    setShowAddVisitor(false);
                    setNotice('Visitor record added.');
                  }}
                  onCancel={() => setShowAddVisitor(false)}
                />
              </div>
            )}

            {/* Visitors Table */}
            {filteredVisitors.length === 0 ? (
              <div className="p-8 text-center text-sm opacity-70">
                {visitorSearch
                  ? `No visitors matching "${visitorSearch}".`
                  : 'No visitors recorded yet. Click "+ Add Visitor" above to register a walk-in.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="admin-table-head text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Visitor</th>
                      <th className="px-4 py-3.5">Visited Date</th>
                      <th className="px-4 py-3.5">Purpose</th>
                      <th className="px-4 py-3.5">Follow-up</th>
                      <th className="px-4 py-3.5">Notes</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y admin-table-border">
                    {filteredVisitors.map((visitor) => (
                      <tr key={visitor.id} className="admin-table-row transition">
                        <td className="px-6 py-4">
                          <b className="block">{visitor.name}</b>
                          <span className="text-xs opacity-70 font-mono">
                            {visitor.mobile || 'No phone'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs opacity-70">
                          {dateLabel(visitor.visit_date)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="admin-tag rounded px-2 py-0.5 text-xs font-medium">
                            {visitor.purpose}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs">
                          {visitor.follow_up_date ? (
                            <span className="text-lime font-mono font-bold">
                              {dateLabel(visitor.follow_up_date)}
                            </span>
                          ) : (
                            <span className="opacity-50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs opacity-70 max-w-[200px] truncate">
                          {visitor.notes || '—'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Remove visitor record for ${visitor.name}?`))
                                return;
                              await supabase
                                ?.from('visitors')
                                .delete()
                                .eq('id', visitor.id);
                              await loadAllData();
                              setNotice('Visitor record removed.');
                            }}
                            className="text-xs text-red-500 hover:underline transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ================= SECTION 3: PLAN EXPIRING SOON ================= */}
          <section id="expiring-soon" className="scroll-mt-6 admin-card overflow-hidden border-lime/40">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b admin-table-border p-6 bg-lime/[0.04]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
                  <p className="eyebrow text-lime">Action Needed</p>
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Plan Expiring Soon</h2>
                  <span className="rounded-full bg-lime/20 px-2.5 py-0.5 text-xs font-bold text-lime">
                    {summary.expiring.length} due
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-75">
                  Memberships expiring within the next 7 days — reach out for renewal
                </p>
              </div>
            </div>

            {summary.expiring.length === 0 ? (
              <div className="p-8 text-center text-sm opacity-70">
                ✨ All memberships are well ahead of renewal. No plans expire within the next 7 days.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="admin-table-head text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Member</th>
                      <th className="px-4 py-3.5">Plan</th>
                      <th className="px-4 py-3.5">Expiry Date</th>
                      <th className="px-4 py-3.5">Urgency</th>
                      <th className="px-4 py-3.5">Paid</th>
                      <th className="px-4 py-3.5 text-right">Quick Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y admin-table-border">
                    {summary.expiring.map((member) => {
                      const daysLeft = getDaysRemaining(member.plan_expiry);
                      return (
                        <tr key={member.id} className="admin-table-row transition">
                          <td className="px-6 py-4">
                            <b className="block">{member.name}</b>
                            <span className="text-xs opacity-70 font-mono">
                              {member.mobile}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="admin-tag rounded px-2.5 py-1 text-xs font-semibold">
                              {member.plan_name}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-lime text-xs">
                            {dateLabel(member.plan_expiry)}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-block rounded-full bg-lime/20 border border-lime/40 px-2.5 py-0.5 text-[11px] font-bold text-lime">
                              {daysLeft === 0
                                ? 'Expires TODAY'
                                : daysLeft === 1
                                ? 'Expires TOMORROW'
                                : `${daysLeft} days remaining`}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs">
                            {money(Number(member.amount_paid || 0))}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {member.mobile ? (
                              <a
                                href={`tel:${member.mobile}`}
                                className="inline-block rounded bg-lime px-3 py-1.5 text-xs font-bold text-ink hover:opacity-90 transition"
                              >
                                Call Member
                              </a>
                            ) : (
                              <span className="text-xs opacity-50">No mobile</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ================= SECTION 4: TRAINERS ================= */}
          <section id="trainers" className="scroll-mt-6 admin-card overflow-hidden">
            <TrainersSection
              trainers={trainers}
              onUpdated={async () => {
                await loadAllData();
                setNotice('Trainers list updated.');
              }}
            />
          </section>

          {/* ================= SECTION 5: MEMBERSHIP PLANS ================= */}
          <section id="membership-plans" className="scroll-mt-6 admin-card overflow-hidden">
            <MembershipPlansSection
              plans={plans}
              onUpdated={async () => {
                await loadAllData();
                setNotice('Membership plans updated.');
              }}
            />
          </section>

          {/* ================= SECTION 6: OPENING HOURS ================= */}
          <section id="opening-hours" className="scroll-mt-6 admin-card overflow-hidden">
            <OpeningHoursSection
              hours={hours}
              onUpdated={async () => {
                await loadAllData();
                setNotice('Opening hours updated.');
              }}
            />
          </section>

          {/* ================= SECTION 7: SETTINGS ================= */}
          <div className="space-y-8 pt-4">
            <div className="border-b admin-table-border pb-4">
              <p className="eyebrow">Public Site & Operations</p>
              <h2 className="display text-3xl">SETTINGS.</h2>
              <p className="mt-1 text-sm opacity-75">
                Configure your public gym presence, equipment lists, and offered fitness services.
              </p>
            </div>

            {/* Sub-section: Gym Details */}
            <section id="gym-details" className="scroll-mt-6 admin-card p-6">
              <div className="flex items-center justify-between pb-4 border-b admin-table-border">
                <div>
                  <p className="eyebrow">Brand & Contact</p>
                  <h3 className="text-xl font-bold mt-1">Gym Details</h3>
                  <p className="text-xs opacity-75">
                    Displayed across the public homepage header, about section, and footer
                  </p>
                </div>
              </div>

              <form onSubmit={saveGymSettings} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field
                      label="Gym Name"
                      value={settings.name}
                      onChange={(val) => setSettings({ ...settings, name: val })}
                      required
                    />
                  </div>
                  <Field
                    label="Phone Number"
                    type="tel"
                    value={settings.phone}
                    onChange={(val) => setSettings({ ...settings, phone: val })}
                  />
                  <Field
                    label="Email Address"
                    type="email"
                    value={settings.email}
                    onChange={(val) => setSettings({ ...settings, email: val })}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Physical Address"
                      value={settings.address}
                      onChange={(val) => setSettings({ ...settings, address: val })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Hero Background Image URL"
                      value={settings.hero_image}
                      onChange={(val) => setSettings({ ...settings, hero_image: val })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label>Gym Tagline / About Description</label>
                    <textarea
                      rows={3}
                      value={settings.description}
                      onChange={(e) =>
                        setSettings({ ...settings, description: e.target.value })
                      }
                      className="admin-input text-sm"
                      placeholder="Tell visitors about the gym ethos, training ground, and mission..."
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button className="rounded-lg bg-lime px-6 py-3 font-bold text-ink hover:opacity-90 transition">
                    Save Gym Details
                  </button>
                </div>
              </form>
            </section>

            {/* Sub-section: Gym Equipments */}
            <section id="gym-equipments" className="scroll-mt-6 admin-card p-6">
              <EquipmentSection
                equipment={equipment}
                onUpdated={async () => {
                  await loadAllData();
                  setNotice('Gym equipment list updated.');
                }}
              />
            </section>

            {/* Sub-section: Services */}
            <section id="services" className="scroll-mt-6 admin-card p-6">
              <ServicesSection
                services={services}
                onUpdated={async () => {
                  await loadAllData();
                  setNotice('Services list updated.');
                }}
              />
            </section>

            {/* Sub-section: Facilities & Gallery */}
            <section id="facilities-gallery" className="scroll-mt-6 admin-card p-6">
              <FacilitiesAndGallerySection
                facilities={facilities}
                gallery={gallery}
                onUpdated={async () => {
                  await loadAllData();
                  setNotice('Facilities & gallery updated.');
                }}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// ======================== UNIFIED SIDEBAR CONTENT COMPONENT ========================

function UnifiedSideNavContent({
  navItems,
  activeSection,
  onSelectSection,
  onCloseMobile,
  onSignOut,
}: {
  navItems: NavItem[];
  activeSection: string;
  onSelectSection: (id: string) => void;
  onCloseMobile?: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b admin-table-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="brand-mark text-sm w-7 h-7">✦</span>
            <div>
              <b className="tracking-tight text-sm block">IRON PEAK</b>
              <span className="eyebrow text-[9px] text-lime">Owner Console</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="opacity-70 hover:opacity-100 text-sm p-1"
                aria-label="Close menu"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Unified Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                  isActive
                    ? 'admin-nav-active'
                    : 'admin-nav-item'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 transition ${
                      isActive ? 'text-lime' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      item.badgeUrgent
                        ? 'bg-lime text-ink'
                        : isActive
                        ? 'bg-lime/20 text-lime'
                        : 'admin-tag'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer in Sidebar */}
      <div className="p-4 border-t admin-table-border space-y-2 opacity-90">
        <a
          href="/"
          className="admin-nav-item flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition"
        >
          <span>View public site</span>
          <span>↗</span>
        </a>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:text-red-600 rounded-lg transition cursor-pointer"
        >
          <IconLogout />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}

// ======================== STAT COMPONENT ========================

function Stat({
  label,
  value,
  detail,
  highlight = false,
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className={`admin-card p-5 transition ${
        onClick ? 'cursor-pointer hover:border-lime/40 hover:-translate-y-0.5' : ''
      } ${highlight ? '!border-lime/60 bg-gradient-to-br from-lime/10 to-transparent' : ''}`}
    >
      <p className="eyebrow">{label}</p>
      <p className="display mt-3 text-4xl tracking-wide">{value}</p>
      <p className="mt-1 text-xs opacity-75">{detail}</p>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        min={type === 'number' ? '0' : undefined}
        className="admin-input"
      />
    </div>
  );
}

// ======================== MEMBER FORM ========================

function MemberForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => Promise<void>;
  onCancel?: () => void;
}) {
  const initial = () => ({
    name: '',
    mobile: '',
    join_date: today(),
    plan_name: 'Standard',
    plan_expiry: afterDays(30),
    amount_paid: '',
    payment_date: today(),
    notes: '',
  });

  const [draft, setDraft] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function add(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const { error } = await supabase!.from('members').insert({
      ...draft,
      amount_paid: Number(draft.amount_paid || 0),
    });

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    } else {
      setDraft(initial());
      setSubmitting(false);
      await onSaved();
    }
  }

  return (
    <form onSubmit={add} className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-bold text-base">Register New Member</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Field
          label="Full Name *"
          value={draft.name}
          onChange={(value) => setDraft({ ...draft, name: value })}
          required
          placeholder="e.g. Rahul Sharma"
        />
        <Field
          label="Mobile Number *"
          type="tel"
          value={draft.mobile}
          onChange={(value) => setDraft({ ...draft, mobile: value })}
          required
          placeholder="+91 98765 43210"
        />
        <Field
          label="Join Date *"
          type="date"
          value={draft.join_date}
          onChange={(value) => setDraft({ ...draft, join_date: value })}
          required
        />
        <div>
          <label>Plan Name *</label>
          <input
            list="plans-datalist"
            value={draft.plan_name}
            onChange={(e) => setDraft({ ...draft, plan_name: e.target.value })}
            required
            placeholder="e.g. Standard, Gold, Peak"
            className="admin-input"
          />
          <datalist id="plans-datalist">
            <option value="START" />
            <option value="BUILD" />
            <option value="PEAK" />
            <option value="Standard" />
            <option value="Annual" />
          </datalist>
        </div>
        <Field
          label="Plan Expiry *"
          type="date"
          value={draft.plan_expiry}
          onChange={(value) => setDraft({ ...draft, plan_expiry: value })}
          required
        />
        <Field
          label="Payment Received (₹)"
          type="number"
          value={draft.amount_paid}
          onChange={(value) => setDraft({ ...draft, amount_paid: value })}
          placeholder="0"
        />
        <Field
          label="Payment Date *"
          type="date"
          value={draft.payment_date}
          onChange={(value) => setDraft({ ...draft, payment_date: value })}
          required
        />
        <div>
          <label>Notes / Goals</label>
          <input
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder="Optional notes"
            className="admin-input"
          />
        </div>
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="admin-tag rounded-lg px-4 py-2.5 text-xs opacity-80 hover:opacity-100 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          disabled={submitting}
          className="rounded-lg bg-lime px-6 py-2.5 text-xs font-bold text-ink hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Confirm & Add Member'}
        </button>
      </div>
    </form>
  );
}

// ======================== VISITOR FORM ========================

function VisitorForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => Promise<void>;
  onCancel?: () => void;
}) {
  const initial = () => ({
    name: '',
    mobile: '',
    visit_date: today(),
    purpose: 'Gym enquiry',
    follow_up_date: '',
    notes: '',
  });

  const [draft, setDraft] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function add(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const { error } = await supabase!.from('visitors').insert({
      ...draft,
      follow_up_date: draft.follow_up_date || null,
    });

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    } else {
      setDraft(initial());
      setSubmitting(false);
      await onSaved();
    }
  }

  return (
    <form onSubmit={add} className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-bold text-base">Record Walk-in Visitor</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <Field
          label="Visitor Name *"
          value={draft.name}
          onChange={(value) => setDraft({ ...draft, name: value })}
          required
          placeholder="e.g. Vikram Verma"
        />
        <Field
          label="Mobile Number"
          type="tel"
          value={draft.mobile}
          onChange={(value) => setDraft({ ...draft, mobile: value })}
          placeholder="Contact number"
        />
        <Field
          label="Visit Date *"
          type="date"
          value={draft.visit_date}
          onChange={(value) => setDraft({ ...draft, visit_date: value })}
          required
        />
        <div>
          <label>Purpose of Visit *</label>
          <input
            list="purpose-datalist"
            value={draft.purpose}
            onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
            required
            placeholder="e.g. Membership enquiry, Day pass"
            className="admin-input"
          />
          <datalist id="purpose-datalist">
            <option value="Gym enquiry" />
            <option value="Day pass trial" />
            <option value="Personal training" />
            <option value="Facility tour" />
          </datalist>
        </div>
        <Field
          label="Follow-up Date"
          type="date"
          value={draft.follow_up_date}
          onChange={(value) => setDraft({ ...draft, follow_up_date: value })}
        />
        <div>
          <label>Notes</label>
          <input
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder="Interests, timings, notes..."
            className="admin-input"
          />
        </div>
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="admin-tag rounded-lg px-4 py-2.5 text-xs opacity-80 hover:opacity-100 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          disabled={submitting}
          className="rounded-lg bg-lime px-6 py-2.5 text-xs font-bold text-ink hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Add Visitor Record'}
        </button>
      </div>
    </form>
  );
}

// ======================== TRAINERS SECTION ========================

function TrainersSection({
  trainers,
  onUpdated,
}: {
  trainers: Trainer[];
  onUpdated: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
  });

  async function addTrainer(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    await supabase.from('trainers').insert({
      ...draft,
      sort_order: trainers.length,
    });
    setDraft({ name: '', role: '', bio: '', image_url: '' });
    setShowAdd(false);
    await onUpdated();
  }

  async function removeTrainer(id: string) {
    if (!window.confirm('Remove this trainer?')) return;
    await supabase!.from('trainers').delete().eq('id', id);
    await onUpdated();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b admin-table-border p-6">
        <div>
          <p className="eyebrow">Floor Staff</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Trainers</h2>
            <span className="admin-tag rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {trainers.length} coaches
            </span>
          </div>
          <p className="mt-1 text-xs opacity-75">
            Coaches, strength trainers, and personal instructors shown on site
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            showAdd
              ? 'admin-tag opacity-90'
              : 'bg-lime text-ink hover:opacity-90'
          }`}
        >
          {showAdd ? '✕ Close Form' : '+ Add Trainer'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addTrainer} className="p-6 border-b admin-card-inner space-y-4">
          <h3 className="font-bold text-base">Add New Trainer</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Field
              label="Trainer Name *"
              value={draft.name}
              onChange={(val) => setDraft({ ...draft, name: val })}
              required
              placeholder="e.g. Alex Hunter"
            />
            <Field
              label="Role / Title *"
              value={draft.role}
              onChange={(val) => setDraft({ ...draft, role: val })}
              required
              placeholder="e.g. Head Strength Coach"
            />
            <Field
              label="Photo URL"
              value={draft.image_url}
              onChange={(val) => setDraft({ ...draft, image_url: val })}
              placeholder="https://..."
            />
            <div>
              <label>Bio / Speciality</label>
              <input
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="10+ yrs Olympic lifting..."
                className="admin-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="admin-tag rounded-lg px-4 py-2 text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-lime px-5 py-2 text-xs font-bold text-ink hover:opacity-90">
              Save Trainer
            </button>
          </div>
        </form>
      )}

      {trainers.length === 0 ? (
        <div className="p-8 text-center text-sm opacity-70">
          No trainers listed yet. Click "+ Add Trainer" to add your gym coaches.
        </div>
      ) : (
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="admin-subcard rounded-xl p-4 flex gap-4 items-start justify-between"
            >
              <div className="flex gap-3">
                {trainer.image_url ? (
                  <img
                    src={trainer.image_url}
                    alt={trainer.name}
                    className="h-12 w-12 rounded-lg object-cover bg-slate-200 dark:bg-zinc-800"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-lime/10 flex items-center justify-center font-bold text-lime">
                    ✦
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm">{trainer.name}</h4>
                  <p className="text-xs text-lime font-mono font-medium">{trainer.role}</p>
                  {trainer.bio && (
                    <p className="text-xs opacity-75 mt-1 line-clamp-2">
                      {trainer.bio}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTrainer(trainer.id)}
                className="text-xs text-red-500 hover:underline cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== MEMBERSHIP PLANS SECTION ========================

function MembershipPlansSection({
  plans,
  onUpdated,
}: {
  plans: MembershipPlan[];
  onUpdated: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    price: '',
    period: 'month',
    description: '',
  });

  async function addPlan(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    await supabase.from('membership_plans').insert({
      ...draft,
      sort_order: plans.length,
    });
    setDraft({ name: '', price: '', period: 'month', description: '' });
    setShowAdd(false);
    await onUpdated();
  }

  async function removePlan(id: string) {
    if (!window.confirm('Remove this membership plan?')) return;
    await supabase!.from('membership_plans').delete().eq('id', id);
    await onUpdated();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b admin-table-border p-6">
        <div>
          <p className="eyebrow">Pricing Tiers</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Membership Plans</h2>
            <span className="admin-tag rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {plans.length} tiers
            </span>
          </div>
          <p className="mt-1 text-xs opacity-75">
            Membership packages and rates displayed to prospective members on the site
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            showAdd
              ? 'admin-tag opacity-90'
              : 'bg-lime text-ink hover:opacity-90'
          }`}
        >
          {showAdd ? '✕ Close Form' : '+ Add Plan'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addPlan} className="p-6 border-b admin-card-inner space-y-4">
          <h3 className="font-bold text-base">Create Membership Tier</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Field
              label="Plan Name *"
              value={draft.name}
              onChange={(val) => setDraft({ ...draft, name: val })}
              required
              placeholder="e.g. BUILD, PEAK"
            />
            <Field
              label="Price (display) *"
              value={draft.price}
              onChange={(val) => setDraft({ ...draft, price: val })}
              required
              placeholder="e.g. ₹2,499"
            />
            <Field
              label="Billing Period *"
              value={draft.period}
              onChange={(val) => setDraft({ ...draft, period: val })}
              required
              placeholder="e.g. month, quarter, year"
            />
            <div>
              <label>Description / Features</label>
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="e.g. Full gym access + sauna"
                className="admin-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="admin-tag rounded-lg px-4 py-2 text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-lime px-5 py-2 text-xs font-bold text-ink hover:opacity-90">
              Save Plan
            </button>
          </div>
        </form>
      )}

      {plans.length === 0 ? (
        <div className="p-8 text-center text-sm opacity-70">
          No membership plans listed yet. Click "+ Add Plan" above.
        </div>
      ) : (
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="admin-subcard rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">{plan.name}</h4>
                  <button
                    type="button"
                    onClick={() => removePlan(plan.id)}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="display text-3xl text-lime">{plan.price}</span>
                  <span className="text-xs opacity-70">/{plan.period || 'mo'}</span>
                </div>
                {plan.description && (
                  <p className="mt-3 text-xs opacity-80 leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== OPENING HOURS SECTION ========================

function OpeningHoursSection({
  hours,
  onUpdated,
}: {
  hours: OpeningHour[];
  onUpdated: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    day: '',
    opens: '',
    closes: '',
  });

  async function addHours(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    await supabase.from('opening_hours').insert({
      ...draft,
      sort_order: hours.length,
    });
    setDraft({ day: '', opens: '', closes: '' });
    setShowAdd(false);
    await onUpdated();
  }

  async function removeHours(id: string) {
    if (!window.confirm('Remove schedule entry?')) return;
    await supabase!.from('opening_hours').delete().eq('id', id);
    await onUpdated();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b admin-table-border p-6">
        <div>
          <p className="eyebrow">Operating Schedule</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Opening Hours</h2>
            <span className="admin-tag rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {hours.length} entries
            </span>
          </div>
          <p className="mt-1 text-xs opacity-75">
            Daily gym access hours published on the website
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            showAdd
              ? 'admin-tag opacity-90'
              : 'bg-lime text-ink hover:opacity-90'
          }`}
        >
          {showAdd ? '✕ Close Form' : '+ Add Hours'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addHours} className="p-6 border-b admin-card-inner space-y-4">
          <h3 className="font-bold text-base">Add Schedule Entry</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Day(s) *"
              value={draft.day}
              onChange={(val) => setDraft({ ...draft, day: val })}
              required
              placeholder="e.g. Monday - Friday"
            />
            <Field
              label="Opens At *"
              value={draft.opens}
              onChange={(val) => setDraft({ ...draft, opens: val })}
              required
              placeholder="e.g. 06:00 AM"
            />
            <Field
              label="Closes At *"
              value={draft.closes}
              onChange={(val) => setDraft({ ...draft, closes: val })}
              required
              placeholder="e.g. 10:00 PM"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="admin-tag rounded-lg px-4 py-2 text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-lime px-5 py-2 text-xs font-bold text-ink hover:opacity-90">
              Save Hours
            </button>
          </div>
        </form>
      )}

      {hours.length === 0 ? (
        <div className="p-8 text-center text-sm opacity-70">
          No opening hours configured. Click "+ Add Hours" above.
        </div>
      ) : (
        <div className="p-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {hours.map((h) => (
              <div
                key={h.id}
                className="admin-subcard rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-sm block">{h.day}</span>
                  <span className="text-xs text-lime font-mono font-medium">
                    {h.opens} — {h.closes}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeHours(h.id)}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ======================== EQUIPMENT SECTION ========================

function EquipmentSection({
  equipment,
  onUpdated,
}: {
  equipment: GenericItem[];
  onUpdated: () => Promise<void>;
}) {
  const [draftTitle, setDraftTitle] = useState('');

  async function addEquipment(e: FormEvent) {
    e.preventDefault();
    if (!draftTitle.trim() || !supabase) return;

    await supabase.from('gym_equipment').insert({
      title: draftTitle.trim(),
      sort_order: equipment.length,
    });
    setDraftTitle('');
    await onUpdated();
  }

  async function removeEquipment(id: string) {
    await supabase!.from('gym_equipment').delete().eq('id', id);
    await onUpdated();
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b admin-table-border">
        <div>
          <p className="eyebrow">Inventory Highlights</p>
          <h3 className="text-xl font-bold mt-1">Gym Equipments</h3>
          <p className="text-xs opacity-75">
            Featured machines, free weights, and gear displayed to prospective trainees
          </p>
        </div>
        <span className="admin-tag rounded-full px-2.5 py-0.5 text-xs font-semibold">
          {equipment.length} items
        </span>
      </div>

      <form onSubmit={addEquipment} className="mt-5 flex gap-3">
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="e.g. Olympic Barbells, Cable Crossover..."
          className="admin-input text-sm"
          required
        />
        <button className="shrink-0 rounded-lg bg-lime px-5 py-2 text-xs font-bold text-ink hover:opacity-90 transition">
          + Add Equipment
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {equipment.map((item) => (
          <span
            key={item.id}
            className="admin-tag inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <span>{item.title}</span>
            <button
              type="button"
              onClick={() => removeEquipment(item.id)}
              className="opacity-60 hover:opacity-100 hover:text-red-500 text-xs cursor-pointer"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ======================== SERVICES SECTION ========================

function ServicesSection({
  services,
  onUpdated,
}: {
  services: GenericItem[];
  onUpdated: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '' });

  async function addService(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    await supabase.from('services').insert({
      ...draft,
      sort_order: services.length,
    });
    setDraft({ title: '', description: '' });
    setShowAdd(false);
    await onUpdated();
  }

  async function removeService(id: string) {
    if (!window.confirm('Remove service?')) return;
    await supabase!.from('services').delete().eq('id', id);
    await onUpdated();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b admin-table-border">
        <div>
          <p className="eyebrow">Training Modalities</p>
          <h3 className="text-xl font-bold mt-1">Services</h3>
          <p className="text-xs opacity-75">
            Training programs, coaching offerings, and class formats
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            showAdd
              ? 'admin-tag opacity-90'
              : 'bg-lime text-ink hover:opacity-90'
          }`}
        >
          {showAdd ? '✕ Close Form' : '+ Add Service'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addService} className="mt-4 p-5 rounded-xl border admin-card-inner space-y-3">
          <Field
            label="Service Title *"
            value={draft.title}
            onChange={(val) => setDraft({ ...draft, title: val })}
            required
            placeholder="e.g. Functional Strength Training"
          />
          <div>
            <label>Service Description</label>
            <input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="e.g. Build foundational power, agility, and mobility..."
              className="admin-input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="admin-tag rounded-lg px-4 py-2 text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-lime px-5 py-2 text-xs font-bold text-ink hover:opacity-90">
              Save Service
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {services.map((item) => (
          <div
            key={item.id}
            className="admin-subcard rounded-xl p-4 flex items-start justify-between"
          >
            <div>
              <h4 className="font-bold text-sm">{item.title}</h4>
              {item.description && (
                <p className="text-xs opacity-75 mt-1">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeService(item.id)}
              className="text-xs text-red-500 hover:underline ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== FACILITIES & GALLERY SECTION ========================

function FacilitiesAndGallerySection({
  facilities,
  gallery,
  onUpdated,
}: {
  facilities: GenericItem[];
  gallery: GalleryImage[];
  onUpdated: () => Promise<void>;
}) {
  const [draftFacility, setDraftFacility] = useState('');
  const [draftImage, setDraftImage] = useState({ image_url: '', caption: '' });

  async function addFacility(e: FormEvent) {
    e.preventDefault();
    if (!draftFacility.trim() || !supabase) return;
    await supabase.from('facilities').insert({
      title: draftFacility.trim(),
      sort_order: facilities.length,
    });
    setDraftFacility('');
    await onUpdated();
  }

  async function removeFacility(id: string) {
    await supabase!.from('facilities').delete().eq('id', id);
    await onUpdated();
  }

  async function addGalleryImage(e: FormEvent) {
    e.preventDefault();
    if (!draftImage.image_url.trim() || !supabase) return;
    await supabase.from('gallery_images').insert({
      ...draftImage,
      sort_order: gallery.length,
    });
    setDraftImage({ image_url: '', caption: '' });
    await onUpdated();
  }

  async function removeGalleryImage(id: string) {
    await supabase!.from('gallery_images').delete().eq('id', id);
    await onUpdated();
  }

  return (
    <div className="space-y-8">
      {/* Facilities */}
      <div>
        <div className="pb-3 border-b admin-table-border">
          <p className="eyebrow">Amenities</p>
          <h3 className="text-lg font-bold mt-0.5">Gym Facilities</h3>
          <p className="text-xs opacity-75">Lockers, recovery zones, member lounges</p>
        </div>

        <form onSubmit={addFacility} className="mt-4 flex gap-3">
          <input
            value={draftFacility}
            onChange={(e) => setDraftFacility(e.target.value)}
            placeholder="e.g. Steam Shower, Members Lounge..."
            className="admin-input text-sm"
            required
          />
          <button className="shrink-0 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-ink hover:opacity-90 transition">
            + Add Facility
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {facilities.map((fac) => (
            <span
              key={fac.id}
              className="admin-tag inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs"
            >
              <span>{fac.title}</span>
              <button
                type="button"
                onClick={() => removeFacility(fac.id)}
                className="opacity-60 hover:opacity-100 hover:text-red-500 text-xs cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Gallery Images */}
      <div className="pt-4 border-t admin-table-border">
        <div className="pb-3 border-b admin-table-border">
          <p className="eyebrow">Visuals</p>
          <h3 className="text-lg font-bold mt-0.5">Gallery Images</h3>
          <p className="text-xs opacity-75">Photos of workout floor, athletes, and training sessions</p>
        </div>

        <form onSubmit={addGalleryImage} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={draftImage.image_url}
            onChange={(e) => setDraftImage({ ...draftImage, image_url: e.target.value })}
            placeholder="Image URL (https://...)"
            className="admin-input text-sm"
            required
          />
          <div className="flex gap-2">
            <input
              value={draftImage.caption}
              onChange={(e) => setDraftImage({ ...draftImage, caption: e.target.value })}
              placeholder="Caption (optional)"
              className="admin-input text-sm"
            />
            <button className="shrink-0 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-ink hover:opacity-90 transition">
              + Add
            </button>
          </div>
        </form>

        <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {gallery.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-xl overflow-hidden border admin-table-border aspect-video bg-zinc-900"
            >
              <img
                src={img.image_url}
                alt={img.caption || 'Gym gallery'}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(img.id)}
                className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-red-300 opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================== ICONS ========================

function IconUsers() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function IconVisitor() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function IconCoach() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconDumbbell() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10M20 7v10M7 5v14M17 5v14M7 12h10" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
