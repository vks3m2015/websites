"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Gym = {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  hero_image?: string;
};
const demo: Gym = {
  name: "IRON PEAK",
  description:
    "The training ground for people who are ready to feel stronger, move better, and show up for themselves.",
  phone: "+91 98765 43210",
  email: "hello@ironpeak.fit",
  address: "Your neighbourhood, Your city",
};
const demoPlans: {
  name: string;
  price: string;
  description: string;
  period?: string;
}[] = [
  { name: "START", price: "₹1,499", description: "Open gym access" },
  { name: "BUILD", price: "₹2,299", description: "Gym + group classes" },
  { name: "PEAK", price: "₹3,499", description: "All access + coaching" },
];
const demoServices = [
  { title: "Strength training" },
  { title: "Functional fitness" },
  { title: "Personal coaching" },
  { title: "Group classes" },
];
const demoEquipment = [
  { title: "Squat racks" },
  { title: "Dumbbells & kettlebells" },
  { title: "Treadmills" },
  { title: "Adjustable benches" },
  { title: "Strength machines" },
  { title: "Exercise bikes" },
  { title: "Battle ropes" },
  { title: "Resistance bands" },
];
const demoFacilities = [
  { title: "Dedicated strength area" },
  { title: "Cardio zone" },
  { title: "Functional training space" },
  { title: "Personal training" },
  { title: "Changing rooms & showers" },
  { title: "Members lounge" },
];

export default function Home() {
  const [gym, setGym] = useState(demo),
    [plans, setPlans] = useState(demoPlans),
    [services, setServices] = useState(demoServices),
    [equipment, setEquipment] = useState(demoEquipment),
    [facilities, setFacilities] = useState(demoFacilities),
    [hours, setHours] = useState<{ day: string; opens: string; closes: string }[]>([]),
    [trainers, setTrainers] = useState<
      { name: string; role: string; bio: string; image_url: string }[]
    >([]),
    [gallery, setGallery] = useState<{ image_url: string; caption: string }[]>(
      [],
    );
  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("gym_settings").select("*").single(),
      supabase.from("membership_plans").select("*").order("sort_order"),
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("gym_equipment").select("*").order("sort_order"),
      supabase.from("facilities").select("*").order("sort_order"),
      supabase.from("opening_hours").select("*").order("sort_order"),
      supabase.from("trainers").select("*").order("sort_order"),
      supabase.from("gallery_images").select("*").order("sort_order"),
    ]).then(([g, p, s, e, f, h, t, i]) => {
      if (g.data) setGym(g.data);
      if (p.data?.length) setPlans(p.data);
      if (s.data?.length) setServices(s.data);
      if (e.data?.length) setEquipment(e.data);
      if (f.data?.length) setFacilities(f.data);
      setHours(h.data || []);
      setTrainers(t.data || []);
      setGallery(i.data || []);
    });
  }, []);
  return (
    <main>
      <nav className="site-nav">
        <div className="shell flex items-center justify-between py-4">
        <a className="flex items-center font-black tracking-tighter text-xl" href="#top">
          <span className="brand-mark">✦</span>{gym.name}
        </a>
        <div className="hidden md:flex gap-7 text-sm text-zinc-300">
          <a className="nav-link" href="#about">About</a>
          <a className="nav-link" href="#services">Training</a>
          <a className="nav-link" href="#equipment">Equipment</a>
          <a className="nav-link" href="#plans">Memberships</a>
          <a className="nav-link" href="#visit">Visit</a>
        </div>
        <a href="/admin" className="pill hover:bg-lime hover:text-ink">
          Owner login
        </a>
        </div>
      </nav>
      <section
        id="top"
        className="grid-line overflow-hidden border-y border-white/10"
      >
        <div className="shell grid min-h-[680px] items-end gap-8 py-20 md:grid-cols-[1.25fr_.75fr]">
          <div>
            <p className="eyebrow mb-5">Train with intent · Open today</p>
            <h1 className="display max-w-3xl text-6xl sm:text-8xl md:text-9xl">
              YOUR
              <br />
              <span className="text-lime">STRONG</span>
              <br />
              STARTS HERE.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-300">
              {gym.description}
            </p>
            <a
              href="#plans"
              className="mt-9 inline-block rounded-full bg-lime px-7 py-4 font-bold text-ink shadow-[0_12px_35px_rgba(199,243,75,.2)] transition hover:-translate-y-1 hover:bg-white"
            >
              Explore memberships →
            </a>
            <div className="mt-12 flex gap-8 text-sm">
              <div className="stat-line"><b className="hero-number block text-2xl text-lime">01</b><span className="text-zinc-400">One goal: progress</span></div>
              <div className="stat-line"><b className="hero-number block text-2xl text-lime">100%</b><span className="text-zinc-400">Effort, every session</span></div>
            </div>
          </div>
          <div className="hero-art card relative min-h-[410px] overflow-hidden p-6 md:min-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-lime/25 via-transparent to-black" />
            {gym.hero_image ? (
              <img
                src={gym.hero_image}
                alt="Gym training"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[11rem] opacity-30">
                ⬡
              </div>
            )}
            <div className="relative mt-auto flex h-full items-end">
              <div className="w-full border-t border-white/20 pt-4"><p className="eyebrow">No shortcuts. Just the work.</p><p className="mt-2 text-sm font-bold">Built for your next rep. ↗</p></div>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="shell grid gap-8 py-24 md:grid-cols-2">
        <p className="eyebrow section-kicker">The Iron Peak standard</p>
        <h2 className="display text-4xl sm:text-6xl">
          A BETTER WAY
          <br />
          TO TRAIN.
        </h2>
        <p className="max-w-lg self-end text-lg leading-relaxed text-zinc-300">
          Expert-led, welcoming, and built around progress that lasts. Whether
          it’s your first session or your thousandth, you belong on the floor.
        </p>
      </section>
      <section id="services" className="bg-mist py-24 text-ink">
        <div className="shell">
        <p className="eyebrow section-kicker !text-[#8c2f1a]">What we do</p>
          <h2 className="display mt-3 text-5xl sm:text-7xl">TRAIN YOUR WAY.</h2>
          <div className="mt-12 grid gap-3 md:grid-cols-2">
            {services.map((s, i) => (
              <div
                key={s.title}
                className="service-tile flex items-center justify-between rounded-xl border border-black/15 p-6 text-xl font-bold"
              >
                <span>0{i + 1}</span>
                <span>{s.title}</span>
                <span>↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="equipment" className="shell py-24">
        <p className="eyebrow section-kicker">Built to perform</p>
        <h2 className="display mt-3 text-5xl sm:text-7xl">EQUIPMENT &amp; FACILITIES.</h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
          Everything you need to train hard, recover well, and make every session count.
        </p>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="equipment-card card p-7">
            <p className="eyebrow">Gym equipment</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {equipment.map((item) => (
                <div key={item.title} className="flex items-center gap-3 border-b border-white/10 py-3 font-bold">
                  <span className="text-lime">✦</span>{item.title}
                </div>
              ))}
            </div>
          </article>
          <article className="equipment-card rounded-[18px] bg-lime p-7 text-ink">
            <p className="eyebrow !text-[#8c2f1a]">Club facilities</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {facilities.map((item) => (
                <div key={item.title} className="flex items-center gap-3 border-b border-[#8c2f1a]/15 py-3 font-bold">
                  <span className="text-[#8c2f1a]">✓</span>{item.title}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
      <section id="plans" className="shell py-24">
        <p className="eyebrow">Memberships</p>
        <h2 className="display mt-3 text-5xl sm:text-7xl">PICK YOUR PACE.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((p, i) => (
            <article
              key={p.name}
              className={
                "plan-card card p-7 " + (i === 1 ? "border-lime bg-lime text-ink shadow-[0_20px_50px_rgba(199,243,75,.16)]" : "")
              }
            >
              <p
                className="eyebrow"
                style={{ color: i === 1 ? "#8c2f1a" : undefined }}
              >
                {p.name}
              </p>
              <p className="display mt-6 text-5xl">{p.price}</p>
              <p className="mt-2 text-sm opacity-70">
                per {p.period || "month"} · {p.description}
              </p>
              <button
                className={
                  "mt-9 w-full rounded-lg py-3 font-bold " +
                  (i === 1 ? "bg-ink text-white" : "bg-white text-ink")
                }
              >
                Choose {p.name}
              </button>
            </article>
          ))}
        </div>
      </section>
      {gallery.length > 0 && (
        <section className="shell py-16">
          <p className="eyebrow">Inside Iron Peak</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((image, i) => (
              <img
                key={i}
                src={image.image_url}
                alt={image.caption || "Iron Peak gym"}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </section>
      )}
      {(trainers.length > 0 || hours.length > 0) && (
        <section className="shell grid gap-12 py-24 md:grid-cols-2">
          <div>
            {trainers.length > 0 && (
              <>
                <p className="eyebrow">Your coaches</p>
                <h2 className="display mt-3 text-4xl">MEET THE TEAM.</h2>
                <div className="mt-7 space-y-3">
                  {trainers.map((t) => (
                    <div key={t.name} className="card flex gap-4 p-4">
                      {t.image_url && (
                        <img
                          src={t.image_url}
                          alt={t.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <b>{t.name}</b>
                        <p className="text-sm text-lime">{t.role}</p>
                        <p className="mt-1 text-sm text-zinc-400">{t.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div>
            {hours.length > 0 && (
              <>
                <p className="eyebrow">Opening hours</p>
                <h2 className="display mt-3 text-4xl">SEE YOU SOON.</h2>
                <div className="mt-7 space-y-2">
                  {hours.map((h) => (
                    <div
                      key={h.day}
                      className="flex justify-between border-b border-white/10 py-3"
                    >
                      <b>{h.day}</b>
                      <span className="text-zinc-400">
                        {h.opens} – {h.closes}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
      <section id="visit" className="bg-lime py-16 text-ink">
        <div className="shell grid gap-8 md:grid-cols-3">
          <div>
            <p className="eyebrow !text-[#8c2f1a]">Come by</p>
            <h2 className="display mt-2 text-4xl">LET&apos;S GET TO WORK.</h2>
          </div>
          <div>
            <b>Find us</b>
            <p className="mt-2 opacity-75">{gym.address}</p>
          </div>
          <div>
            <b>Questions?</b>
            <p className="mt-2 opacity-75">
              {gym.phone}
              <br />
              {gym.email}
            </p>
          </div>
        </div>
      </section>
      <footer className="shell flex flex-wrap justify-between gap-3 py-7 text-xs text-zinc-500">
        <span>
          © {new Date().getFullYear()} {gym.name}
        </span>
        <a href="/admin">Owner dashboard</a>
      </footer>
    </main>
  );
}
