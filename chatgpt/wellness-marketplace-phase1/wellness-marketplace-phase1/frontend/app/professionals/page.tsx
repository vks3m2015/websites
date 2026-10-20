"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { MapPin, Star } from "lucide-react";

type Pro={id:number,name:string,area:string,city:string,bio:string,experienceYears:number,verified:boolean,services:{id:number,name:string,price:number,durationMinutes:number}[]};

export default function Professionals(){
 const [items,setItems]=useState<Pro[]>([]);
 const [service,setService]=useState("");
 const [lat,setLat]=useState("");
 const [lon,setLon]=useState("");
 const [loading,setLoading]=useState(true);
 const load=async()=>{
  setLoading(true);
  try {
   const qs=new URLSearchParams();
   if(service) qs.set("service",service);
   if(lat&&lon){qs.set("lat",lat);qs.set("lon",lon)}
   qs.set("radiusKm","15");
   setItems(await api<Pro[]>(`/professionals?${qs}`));
  } finally {setLoading(false)}
 };
 useEffect(()=>{load()},[]);
 return <main>
  <nav className="bg-white border-b"><div className="container py-4 flex justify-between"><Link href="/" className="text-2xl font-black">wellora<span className="text-[#b38b4d]">.</span></Link><Link href="/login" className="btn btn-light">Login</Link></div></nav>
  <div className="container py-10">
   <h1 className="text-4xl font-black mb-2">Wellness professionals</h1>
   <p className="muted mb-7">Explore professionals and their available services.</p>
   <div className="card p-4 mb-8 grid md:grid-cols-[1fr_1fr_120px] gap-3">
    <input className="border rounded-xl p-3" value={service} onChange={e=>setService(e.target.value)} placeholder="Search service"/>
    <div className="flex gap-2"><input className="border rounded-xl p-3 w-full" value={lat} onChange={e=>setLat(e.target.value)} placeholder="Latitude"/><input className="border rounded-xl p-3 w-full" value={lon} onChange={e=>setLon(e.target.value)} placeholder="Longitude"/></div>
    <button className="btn btn-primary" onClick={load}>Search</button>
   </div>
   {loading?<p>Loading...</p>:<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
    {items.map(p=><Link href={`/professionals/${p.id}`} key={p.id} className="card p-6 hover:-translate-y-1 transition">
      <div className="w-16 h-16 rounded-2xl bg-[#dfece4] flex items-center justify-center text-xl font-black mb-4">{p.name.slice(0,1)}</div>
      <div className="flex justify-between gap-3"><h2 className="text-xl font-bold">{p.name}</h2>{p.verified&&<span className="text-xs bg-[#dfece4] px-2 py-1 rounded-full h-fit">Verified</span>}</div>
      <p className="muted mt-1 flex gap-1 items-center"><MapPin size={15}/>{p.area}, {p.city}</p>
      <p className="text-sm mt-4">{p.experienceYears} years experience</p>
      <div className="flex flex-wrap gap-2 mt-4">{p.services.slice(0,3).map(s=><span key={s.id} className="text-xs bg-[#f1efe9] rounded-full px-3 py-2">{s.name} · ₹{s.price}</span>)}</div>
    </Link>)}
   </div>}
   {!loading&&!items.length&&<div className="card p-10 text-center">No professionals found. Try a different service or search area.</div>}
  </div>
 </main>
}
