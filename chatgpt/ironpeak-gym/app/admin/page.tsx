'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

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

const empty: Settings = {
  name: 'Iron Peak',
  description: '',
  phone: '',
  email: '',
  address: '',
  hero_image: '',
};

const sections = [
  { title: 'Opening hours', table: 'opening_hours', fields: 'day,opens,closes' },
  { title: 'Trainers', table: 'trainers', fields: 'name,role,bio,image_url' },
  { title: 'Services', table: 'services', fields: 'title,description' },
  { title: 'Gym equipment', table: 'gym_equipment', fields: 'title' },
  { title: 'Facilities', table: 'facilities', fields: 'title' },
  {
    title: 'Membership plans',
    table: 'membership_plans',
    fields: 'name,price,period,description',
  },
  { title: 'Gallery images', table: 'gallery_images', fields: 'image_url,caption' },
];

const today = () => new Date().toISOString().slice(0, 10);

const afterDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function Admin() {
  const [settings, setSettings] = useState<Settings>(empty),
    [notice, setNotice] = useState(''),
    [loggedIn, setLoggedIn] = useState(false),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState('');

  const [members, setMembers] = useState<Member[]>([]),
    [visitors, setVisitors] = useState<Visitor[]>([]);

  const loadManagement = async () => {
    if (!supabase) return;
    const client = supabase!;

    const [memberResult, visitorResult] = await Promise.all([
      client.from('members').select('*').order('plan_expiry'),
      client.from('visitors').select('*').order('visit_date', { ascending: false }),
    ]);

    setMembers((memberResult.data as Member[]) || []);
    setVisitors((visitorResult.data as Visitor[]) || []);
  };

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const signedIn = !!data.session;
      setLoggedIn(signedIn);
      if (signedIn) loadManagement();
    });

    supabase
      .from('gym_settings')
      .select('*')
      .single()
      .then(({ data }) => data && setSettings(data));
  }, []);

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

  if (!supabase) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="card max-w-lg p-8">
          <p className="eyebrow">Setup needed</p>
          <h1 className="display mt-3 text-4xl">CONNECT SUPABASE.</h1>
          <p className="mt-5 leading-relaxed text-zinc-300">
            Copy <code>.env.local.example</code> to <code>.env.local</code>, add
            your project URL and anonymous key, then restart the site.
          </p>
          <a href="/" className="mt-7 inline-block text-lime">
            ← Back to site
          </a>
        </div>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!supabase) return;

            const { error } = await supabase!.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setNotice(error.message);
            } else {
              setLoggedIn(true);
              loadManagement();
            }
          }}
          className="card w-full max-w-md p-8"
        >
          <p className="eyebrow">Owner area</p>
          <h1 className="display mt-3 text-4xl">WELCOME BACK.</h1>

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

          {notice && <p className="mt-3 text-sm text-red-300">{notice}</p>}

          <button className="mt-6 w-full rounded-lg bg-lime py-3 font-bold text-ink">
            Log in
          </button>

          <a href="/" className="mt-5 block text-center text-sm text-zinc-400">
            Back to public site
          </a>
        </form>
      </main>
    );
  }

  async function save(event: FormEvent) {
    event.preventDefault();

    const { error } = await supabase!.from('gym_settings').upsert({
      ...settings,
      id: settings.id || '00000000-0000-0000-0000-000000000001',
    });

    setNotice(
      error
        ? error.message
        : 'Saved — the public site now has your latest details.',
    );
  }

  return (
    <main className="min-h-screen bg-[#101321]">
      <header className="border-b border-white/10">
        <div className="shell flex flex-wrap justify-between gap-4 py-5">
          <b>
            IRON PEAK <span className="text-lime">/ OWNER</span>
          </b>

          <div className="flex gap-5">
            <a href="/" className="text-sm">
              View site ↗
            </a>
            <button
              className="text-sm text-zinc-400"
              onClick={() => {
                if (!supabase) return;
                supabase!.auth.signOut().then(() => setLoggedIn(false));
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="shell py-10">
        <p className="eyebrow">Gym management</p>
        <h1 className="display mt-2 text-5xl">RUN THE FLOOR.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Manage memberships, track walk-ins, and see the numbers that need your
          attention.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active members" value={String(summary.active.length)} detail="Plans valid today" />
          <Stat label="Expiring soon" value={String(summary.expiring.length)} detail="Within the next 7 days" highlight />
          <Stat label="Visitors" value={String(visitors.length)} detail="All recorded walk-ins" />
          <Stat label="This month" value={money(summary.earnings)} detail="Recorded membership payments" />
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <MemberForm onSaved={loadManagement} />
          <VisitorForm onSaved={loadManagement} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <MemberTable
            title="Active members"
            subtitle="Current, valid memberships"
            members={summary.active}
            empty="No active members yet."
            onChanged={loadManagement}
          />
          <MemberTable
            title="Plans expiring soon"
            subtitle="Renew before the next seven days are up"
            members={summary.expiring}
            empty="No plans expire within the next 7 days."
            onChanged={loadManagement}
            urgency
          />
        </section>

        <VisitorTable visitors={visitors} onChanged={loadManagement} />

        {notice && (
          <p className="mt-5 rounded-lg border border-lime/40 bg-lime/10 p-3 text-sm text-lime">
            {notice}
          </p>
        )}

        <form onSubmit={save} className="card mt-10 p-6">
          <p className="eyebrow">Public site</p>
          <h2 className="mt-2 text-xl font-bold">Gym details</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(['name', 'phone', 'email', 'address', 'hero_image'] as const).map(
              (key) => (
                <div
                  key={key}
                  className={
                    key === 'name' || key === 'address' || key === 'hero_image'
                      ? 'md:col-span-2'
                      : ''
                  }
                >
                  <label>{key.replace('_', ' ')}</label>
                  <input
                    value={settings[key]}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        [key]: event.target.value,
                      })
                    }
                  />
                </div>
              ),
            )}

            <div className="md:col-span-2">
              <label>Description</label>
              <textarea
                rows={4}
                value={settings.description}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    description: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <button className="mt-5 rounded-lg bg-lime px-5 py-3 font-bold text-ink">
            Save gym details
          </button>
        </form>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <CollectionEditor key={section.table} {...section} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <article className={`card p-5 ${highlight ? 'border-lime/50' : ''}`}>
      <p className="eyebrow">{label}</p>
      <p className="display mt-4 text-4xl text-white">{value}</p>
      <p className="mt-2 text-xs text-zinc-400">{detail}</p>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={type === 'number' ? '0' : undefined}
      />
    </div>
  );
}

function MemberForm({ onSaved }: { onSaved: () => Promise<void> }) {
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

  const [draft, setDraft] = useState(initial),
    [notice, setNotice] = useState('');

  async function add(event: FormEvent) {
    event.preventDefault();

    const { error } = await supabase!.from('members').insert({
      ...draft,
      amount_paid: Number(draft.amount_paid || 0),
    });

    if (error) {
      setNotice(error.message);
    } else {
      setDraft(initial());
      setNotice('Member added.');
      await onSaved();
    }
  }

  return (
    <form onSubmit={add} className="card p-6">
      <p className="eyebrow">New membership</p>
      <h2 className="mt-2 text-xl font-bold">Add a member</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field
          label="Member name"
          value={draft.name}
          onChange={(value) => setDraft({ ...draft, name: value })}
          required
        />
        <Field
          label="Mobile number"
          type="tel"
          value={draft.mobile}
          onChange={(value) => setDraft({ ...draft, mobile: value })}
          required
        />
        <Field
          label="Date joined"
          type="date"
          value={draft.join_date}
          onChange={(value) => setDraft({ ...draft, join_date: value })}
          required
        />
        <Field
          label="Plan"
          value={draft.plan_name}
          onChange={(value) => setDraft({ ...draft, plan_name: value })}
          required
        />
        <Field
          label="Plan expiry"
          type="date"
          value={draft.plan_expiry}
          onChange={(value) => setDraft({ ...draft, plan_expiry: value })}
          required
        />
        <Field
          label="Payment received (₹)"
          type="number"
          value={draft.amount_paid}
          onChange={(value) => setDraft({ ...draft, amount_paid: value })}
        />
        <Field
          label="Payment date"
          type="date"
          value={draft.payment_date}
          onChange={(value) => setDraft({ ...draft, payment_date: value })}
          required
        />
        <div>
          <label>Notes</label>
          <input
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder="Optional"
          />
        </div>
      </div>

      <button className="mt-5 rounded-lg bg-lime px-5 py-3 font-bold text-ink">
        Add member
      </button>

      {notice && <p className="mt-3 text-sm text-lime">{notice}</p>}
    </form>
  );
}

function VisitorForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const initial = () => ({
    name: '',
    mobile: '',
    visit_date: today(),
    purpose: 'Gym enquiry',
    follow_up_date: '',
    notes: '',
  });

  const [draft, setDraft] = useState(initial),
    [notice, setNotice] = useState('');

  async function add(event: FormEvent) {
    event.preventDefault();

    const { error } = await supabase!.from('visitors').insert({
      ...draft,
      follow_up_date: draft.follow_up_date || null,
    });

    if (error) {
      setNotice(error.message);
    } else {
      setDraft(initial());
      setNotice('Visitor added.');
      await onSaved();
    }
  }

  return (
    <form onSubmit={add} className="card p-6">
      <p className="eyebrow">Walk-in register</p>
      <h2 className="mt-2 text-xl font-bold">Add a visitor</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field
          label="Visitor name"
          value={draft.name}
          onChange={(value) => setDraft({ ...draft, name: value })}
          required
        />
        <Field
          label="Mobile number"
          type="tel"
          value={draft.mobile}
          onChange={(value) => setDraft({ ...draft, mobile: value })}
        />
        <Field
          label="Visit date"
          type="date"
          value={draft.visit_date}
          onChange={(value) => setDraft({ ...draft, visit_date: value })}
          required
        />
        <Field
          label="Purpose"
          value={draft.purpose}
          onChange={(value) => setDraft({ ...draft, purpose: value })}
          required
        />
        <Field
          label="Follow-up date"
          type="date"
          value={draft.follow_up_date}
          onChange={(value) =>
            setDraft({ ...draft, follow_up_date: value })
          }
        />
        <div>
          <label>Notes</label>
          <input
            value={draft.notes}
            onChange={(event) =>
              setDraft({ ...draft, notes: event.target.value })
            }
            placeholder="Optional"
          />
        </div>
      </div>

      <button className="mt-5 rounded-lg bg-white px-5 py-3 font-bold text-ink">
        Add visitor
      </button>

      {notice && <p className="mt-3 text-sm text-lime">{notice}</p>}
    </form>
  );
}

function MemberTable({
  title,
  subtitle,
  members,
  empty,
  onChanged,
  urgency = false,
}: {
  title: string;
  subtitle: string;
  members: Member[];
  empty: string;
  onChanged: () => Promise<void>;
  urgency?: boolean;
}) {
  async function remove(id: string) {
    if (!window.confirm('Remove this member record?')) return;
    await supabase!.from('members').delete().eq('id', id);
    await onChanged();
  }

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/10 p-6">
        <p className="eyebrow">{urgency ? 'Action needed' : 'Memberships'}</p>
        <h2 className="mt-2 text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      {members.length === 0 ? (
        <p className="p-6 text-sm text-zinc-400">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-3">Member</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-white/10">
                  <td className="px-6 py-4">
                    <b>{member.name}</b>
                    <span className="mt-1 block text-xs text-zinc-400">
                      {member.mobile}
                    </span>
                  </td>
                  <td className="px-4 py-4">{member.plan_name}</td>
                  <td className={`px-4 py-4 ${urgency ? 'font-bold text-lime' : ''}`}>
                    {dateLabel(member.plan_expiry)}
                  </td>
                  <td className="px-4 py-4">
                    {money(Number(member.amount_paid || 0))}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => remove(member.id)}
                      className="text-xs text-red-300"
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
  );
}

function VisitorTable({
  visitors,
  onChanged,
}: {
  visitors: Visitor[];
  onChanged: () => Promise<void>;
}) {
  async function remove(id: string) {
    if (!window.confirm('Remove this visitor record?')) return;
    await supabase!.from('visitors').delete().eq('id', id);
    await onChanged();
  }

  return (
    <section className="card mt-5 overflow-hidden">
      <div className="border-b border-white/10 p-6">
        <p className="eyebrow">Walk-in register</p>
        <h2 className="mt-2 text-xl font-bold">Visitors</h2>
      </div>

      {visitors.length === 0 ? (
        <p className="p-6 text-sm text-zinc-400">No visitor records yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-3">Visitor</th>
                <th className="px-4 py-3">Visited</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="border-t border-white/10">
                  <td className="px-6 py-4">
                    <b>{visitor.name}</b>
                    <span className="mt-1 block text-xs text-zinc-400">
                      {visitor.mobile || 'No number supplied'}
                    </span>
                  </td>
                  <td className="px-4 py-4">{dateLabel(visitor.visit_date)}</td>
                  <td className="px-4 py-4">{visitor.purpose}</td>
                  <td className="px-4 py-4">
                    {visitor.follow_up_date ? dateLabel(visitor.follow_up_date) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => remove(visitor.id)}
                      className="text-xs text-red-300"
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
  );
}

function CollectionEditor({
  title,
  table,
  fields,
}: {
  title: string;
  table: string;
  fields: string;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]),
    [draft, setDraft] = useState<Record<string, string>>({});

  const cols = fields.split(',');

  useEffect(() => {
    supabase!.from(table).select('*').order('sort_order').then(({ data }) => {
      setRows(data || []);
    });
  }, [table]);

  async function add(event: FormEvent) {
    event.preventDefault();

    const { data, error } = await supabase!
      .from(table)
      .insert({ ...draft, sort_order: rows.length })
      .select()
      .single();

    if (!error && data) {
      setRows([...rows, data]);
      setDraft({});
    }
  }

  async function remove(id: string) {
    await supabase!.from(table).delete().eq('id', id);
    setRows(rows.filter((row) => row.id !== id));
  }

  return (
    <section className="card p-6">
      <h2 className="font-bold">{title}</h2>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded bg-black/25 px-3 py-2 text-sm"
          >
            <span>{row[cols[0]]}</span>
            <button
              type="button"
              onClick={() => remove(row.id)}
              className="text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="mt-4 space-y-2">
        {cols.map((column) => (
          <input
            key={column}
            placeholder={column.replace('_', ' ')}
            value={draft[column] || ''}
            onChange={(event) =>
              setDraft({ ...draft, [column]: event.target.value })
            }
            required={column !== 'image_url'}
          />
        ))}

        <button className="rounded bg-white px-3 py-2 text-sm font-bold text-ink">
          Add {title.slice(0, -1)}
        </button>
      </form>
    </section>
  );
}
