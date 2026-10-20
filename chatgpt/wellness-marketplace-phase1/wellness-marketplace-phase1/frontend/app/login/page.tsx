"use client";
import { useState } from "react";
import Link from "next/link";
import { api,setToken } from "../../lib/api";
export default function Login(){
 const [email,setEmail]=useState("customer@example.com"),[password,setPassword]=useState("password123"),[error,setError]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();try{const r=await api<{token:string}>("/auth/login",{method:"POST",body:JSON.stringify({email,password})});setToken(r.token);location.href="/dashboard"}catch(e:any){setError(e.message)}}
 return <main className="min-h-screen flex items-center justify-center p-5"><form onSubmit={submit} className="card p-8 w-full max-w-md"><Link href="/" className="text-2xl font-black">wellora<span className="text-[#b38b4d]">.</span></Link><h1 className="text-3xl font-black mt-10 mb-6">Welcome back</h1><input className="border rounded-xl p-3 w-full mb-3" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/><input className="border rounded-xl p-3 w-full mb-4" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/><button className="btn btn-primary w-full">Login</button>{error&&<p className="text-red-700 mt-3">{error}</p>}<p className="muted mt-5 text-sm">Demo: customer@example.com / password123</p><Link href="/register" className="block mt-5 text-center font-semibold">Create account</Link></form></main>
}
