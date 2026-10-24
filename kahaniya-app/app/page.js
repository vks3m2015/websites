'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
export default function Home() {
  const [l, setL] = useState(null)
  useEffect(() => { supabase.from('stories').select('id,title,body,pen_name,created_at').eq('status', 'approved').order('created_at', { ascending: false }).then(({ data }) => setL(data || [])) }, [])
  return (
    <main><h1>Real stories. Real lives.</h1>
      <p className="sub">Read the experiences of people in their own words, or share yours anonymously.</p>
      <Link className="btn" href="/write">Share your story</Link><h2>Latest stories</h2>
      {l === null && <p className="sub">Loading…</p>}{l && !l.length && <p className="sub">No stories yet.</p>}
      {l?.map(s => <Link key={s.id} href={`/story/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><div className="card"><h3>{s.title}</h3>
        <div className="meta">by {s.pen_name || 'Anonymous'} · {s.created_at.slice(0, 10)}</div><p>{s.body.replace(/^## .*$/gm, '').trim().slice(0, 150)}…</p></div></Link>)}
    </main>)
}
