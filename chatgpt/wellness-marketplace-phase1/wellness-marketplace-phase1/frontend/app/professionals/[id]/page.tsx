"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useParams,useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { CalendarDays, MapPin, CheckCircle2 } from "lucide-react";

type Pro={id:number,name:string,area:string,city:string,bio:string,experienceYears:number,verified:boolean,services:{id:number,name:string,description:string,price:number,durationMinutes:number}[]};
type Slot={id:number,dayOfWeek:number,startTime:string,endTime:string};

export default function Profile(){
 const {id}=useParams(); const router=useRouter();
 const [p,setP]=useState<Pro|null>(null); const [slots,setSlots]=useState<Slot[]>([]);
 const [date,setDate]=useState(""); const [selected,setSelected]=useState<number|null>(null); const [message,setMessage]=useState("");
 useEffect(()=>{Promise.all([api<Pro>(`/professionals/${id}`),api<Slot[]>(`/professionals/${id}/availability`)]).then(([a,b])=>{setP(a);setSlots(b)})},[id]);
 if(!p)return <main className="container py-20">Loading...</main>;
 const book=async()=>{
  if(!selected||!date){setMessage("Select a service and date.");return}
  try {
   await api("/bookings",{method:"POST",body:JSON.stringify({professionalId:p.id,serviceId:selected,startTime:`${date}T10:00:00`})});
   setMessage("Booking confirmed. View it from your dashboard.");
  } catch(e:any){setMessage(e.message)}
 };
 return <main>
  <nav className="bg-white border-b"><div className="container py-4 flex justify-between"><Link href="/" className="text-2xl font-black">wellora<span className="text-[#b38b4d]">.</span></Link><Link href="/login" className="btn btn-light">Login</Link></div></nav>
  <div className="container py-10">
   <Link href="/professionals" className="muted">← Back to professionals</Link>
   <div className="grid lg:grid-cols-[1.3fr_.7fr] gap-8 mt-5">
    <section>
     <div className="card p-8">
      <div className="flex gap-5 items-start"><div className="w-24 h-24 rounded-3xl bg-[#dfece4] flex items-center justify-center text-3xl font-black">{p.name[0]}</div><div><h1 className="text-3xl font-black">{p.name}</h1><div className="flex gap-2 items-center mt-2 muted"><MapPin size={16}/>{p.area}, {p.city}</div>{p.verified&&<div className="flex gap-1 items-center text-sm mt-3"><CheckCircle2 size={16}/> Verified professional</div>}</div></div>
      <p className="muted mt-7 leading-7">{p.bio}</p>
      <p className="font-semibold mt-5">{p.experienceYears} years experience</p>
     </div>
     <h2 className="text-2xl font-black mt-8 mb-4">Services</h2>
     <div className="grid gap-4">{p.services.map(s=><button onClick={()=>setSelected(s.id)} key={s.id} className={`card p-5 text-left ${selected===s.id?"ring-2 ring-[#17352e]":""}`}>
       <div className="flex justify-between"><h3 className="font-bold text-lg">{s.name}</h3><strong>₹{s.price}</strong></div><p className="muted text-sm mt-2">{s.description}</p><p className="text-sm mt-3">{s.durationMinutes} minutes</p>
     </button>)}</div>
    </section>
    <aside className="card p-6 h-fit sticky top-5">
     <div className="flex gap-2 items-center font-bold mb-5"><CalendarDays/> Book appointment</div>
     <label className="text-sm font-semibold">Date</label><input type="date" className="border rounded-xl p-3 w-full mt-2" value={date} onChange={e=>setDate(e.target.value)}/>
     <div className="mt-5"><label className="text-sm font-semibold">Available schedule</label><div className="grid gap-2 mt-2">{slots.map(s=><div key={s.id} className="bg-[#f1efe9] rounded-xl p-3 text-sm">Day {s.dayOfWeek}: {s.startTime} – {s.endTime}</div>)}</div></div>
     <button className="btn btn-primary w-full mt-6" onClick={book}>Confirm 10:00 AM booking</button>
     {message&&<p className="text-sm mt-4 bg-[#dfece4] p-3 rounded-xl">{message}</p>}
     <p className="text-xs muted mt-4">Phase 1 uses a simple 10:00 AM booking flow. Slot generation UI will be expanded in the next phase.</p>
    </aside>
   </div>
  </div>
 </main>
}
