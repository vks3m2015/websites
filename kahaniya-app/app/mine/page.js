'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
export default function Mine() {
  const user = useUser(), router = useRouter(), [l, setL] = useState(null)
  const load = () => supabase.rpc('my_stories').then(({ data }) => setL(data || []))
  useEffect(() => { if (user === null) router.push('/signin'); if (user) load() }, [user])
  async function del(id) { if (confirm('Delete this story permanently?')) { await supabase.rpc('delete_story', { p_id: id }); load() } }
  async function delAccount() {
    if (!confirm('Delete your account and all your stories? This cannot be undone.')) return
    const { data } = await supabase.auth.getSession()
    const r = await fetch('/api/delete-account', { method: 'POST', headers: { Authorization: 'Bearer ' + data.session.access_token } })
    if (r.ok) { await supabase.auth.signOut(); router.push('/') } else alert('Could not delete the account. Please try again.')
  }
  if (!l) return <main><p className="sub">Loading…</p></main>
  return (<main><h1>My stories</h1><p className="sub">Only you can see this list. Your stories are published as soon as you submit them.</p>
    <Link className="btn" href="/write">Write a new story</Link><div style={{ height: 14 }} />
    {!l.length && <p className="sub">You haven’t submitted any stories yet.</p>}
    {l.map(s => <div className="card" key={s.id}><h3>{s.title}</h3><div className="meta">Shown as {s.pen_name || 'Anonymous'} · {s.created_at.slice(0, 10)}</div>
      <div style={{ marginTop: 10 }}><Link className="btn alt" href={`/story/${s.id}`}>View</Link> <Link className="btn alt" href={`/edit/${s.id}`}>Edit</Link> <button className="btn bad" onClick={() => del(s.id)}>Delete</button></div></div>)}
    <div className="card"><h3>Delete my account</h3><p className="meta">This permanently deletes your account and all your stories.</p><button className="btn bad" onClick={delAccount}>Delete my account</button></div></main>)
}
