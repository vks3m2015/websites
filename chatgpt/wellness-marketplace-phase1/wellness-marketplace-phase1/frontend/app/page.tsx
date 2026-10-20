"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, ShieldCheck, CalendarDays, Sparkles } from "lucide-react";

export default function Home(){
 const [service,setService]=useState("");
 const [area,setArea]=useState("");
 const search=()=>location.href=`/professionals?service=${encodeURIComponent(service)}&area=${encodeURIComponent(area)}`;
 return <main>
  <nav className="bg-white/90 border-b sticky top-0 z-10">
   <div className="container h-18 flex items-center justify-between py-4">
    <Link href="/" className="text-2xl font-black tracking-tight">wellora<span className="text-[#b38b4d]">.</span></Link>
    <div className="flex gap-2"><Link className="btn btn-light" href="/login">Login</Link><Link className="btn btn-primary" href="/register">Join</Link></div>
   </div>
  </nav>

  <section className="py-18 md:py-28">
   <div className="container grid md:grid-cols-2 gap-12 items-center">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-[#dfece4] px-4 py-2 text-sm font-semibold mb-6"><Sparkles size={16}/> Professional wellness, made simple</div>
      <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">Wellness professionals, <span className="text-[#b38b4d]">near you.</span></h1>
      <p className="text-lg muted mb-8 max-w-xl">Discover verified wellness professionals, explore their services and book a convenient appointment across Delhi NCR.</p>
      <div className="card p-3 grid md:grid-cols-[1fr_1fr_auto] gap-2">
       <div className="flex items-center gap-2 p-3"><MapPin size={20}/><input value={area} onChange={e=>setArea(e.target.value)} placeholder="Area e.g. Faridabad" className="outline-none w-full"/></div>
       <div className="flex items-center gap-2 p-3 border-t md:border-t-0 md:border-l"><Search size={20}/><input value={service} onChange={e=>setService(e.target.value)} placeholder="Service" className="outline-none w-full"/></div>
       <button onClick={search} className="btn btn-primary">Search</button>
      </div>
    </div>
    <div className="rounded-[32px] bg-[#dfece4] min-h-[390px] flex items-center justify-center p-10">
      <div className="card p-8 max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#17352e] text-white flex items-center justify-center mb-5"><ShieldCheck/></div>
        <h2 className="text-2xl font-bold mb-2">Professional & trusted</h2>
        <p className="muted">Profiles, services and appointment information are organized so customers can choose with confidence.</p>
      </div>
    </div>
   </div>
  </section>

  <section className="py-16 bg-white"><div className="container">
    <h2 className="text-3xl font-black mb-8">How it works</h2>
    <div className="grid md:grid-cols-3 gap-5">
      {[["01","Discover","Search professionals by area, service and distance."],["02","Choose","Compare profiles, services, prices and availability."],["03","Book","Select a suitable time and confirm your appointment."]].map(x=>
       <div className="card p-7" key={x[0]}><div className="text-sm font-bold text-[#b38b4d] mb-4">{x[0]}</div><h3 className="text-xl font-bold mb-2">{x[1]}</h3><p className="muted">{x[2]}</p></div>)}
    </div>
  </div></section>
 </main>
}
