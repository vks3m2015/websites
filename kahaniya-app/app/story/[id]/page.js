'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import StoryBody from '@/components/StoryBody'
export default function Story({ params }) {
  const [s, setS] = useState(undefined)
  useEffect(() => { supabase.from('stories').select('*').eq('id', params.id).eq('status', 'approved').maybeSingle().then(({ data }) => setS(data)) }, [])
  if (s === undefined) return <main><p className="sub">Loading…</p></main>
  if (!s) return <main><p>Story not found. <Link href="/">Back to stories</Link></p></main>
  return (<main><Link href="/" className="meta">← All stories</Link><h1>{s.title}</h1>
    <div className="meta">by {s.pen_name || 'Anonymous'} · {s.created_at.slice(0, 10)}</div><div className="card" style={{ marginTop: 14 }}><StoryBody body={s.body} /></div></main>)
}
