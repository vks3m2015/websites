"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { api,clearToken } from "../../lib/api";
type Booking={id:number,professional:string,service:string,startTime:string,endTime:string,price:string,status:string};
export default function Dashboard(){
 const [items,setItems]=useState<Booking[]>([]); const [error,setError]=useState("");
 useEffect(()=>{api<Booking[]>("/bookings/mine").then(setItems).catch(e=>setError(e.message))},[]);
 return <main><nav className="bg-white border-b"><div className="container py-4 flex justify-between"><Link href="/" className="text-2xl font-black">wellora<span className="text-[#b38b4d]">.</span></Link><button className="btn btn-light" onClick={()=>{clearToken();location.href="/"}}>Logout</button></div></nav><div className="container py-10"><h1 className="text-4xl font-black">My bookings</h1><p className="muted mt-2 mb-8">Your appointments appear here.</p>{error?<div className="card p-6">{error} — please login first.</div>:<div className="grid gap-4">{items.map(b=><div className="card p-5" key={b.id}><div className="flex justify-between"><div><h2 className="font-bold text-lg">{b.service}</h2><p className="muted">{b.professional}</p></div><span className="bg-[#dfece4] px-3 py-1 rounded-full text-sm">{b.status}</span></div><p className="mt-4">{new Date(b.startTime).toLocaleString()} · ₹{b.price}</p></div>)}</div>}{!error&&!items.length&&<div className="card p-8">No bookings yet. <Link className="font-bold" href="/professionals">Find a professional →</Link></div>}</div></main>
}
