'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import StoryForm from '@/components/StoryForm'
export default function Edit({ params }) {
  const [s, setS] = useState(undefined)
  useEffect(() => { supabase.rpc('my_stories').then(({ data }) => setS((data || []).find(x => x.id === params.id) || null)) }, [])
  if (s === undefined) return <main><p className="sub">Loading…</p></main>
  if (!s) return <main><p>Story not found.</p></main>
  return <StoryForm initial={s} />
}
