'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
const HEADS = ['Coming out', 'How my family reacted', 'My childhood', 'Friends and community', 'Love and relationships', 'What I wish I had known', 'A message to others']
export default function StoryForm({ initial }) {
  const user = useUser(), router = useRouter(), ta = useRef(null), t0 = useRef(Date.now())
  const [title, setTitle] = useState(initial?.title || ''), [body, setBody] = useState(initial?.body || '')
  const [mode, setMode] = useState(initial?.pen_name ? 'p' : 'a'), [pen, setPen] = useState(initial?.pen_name || '')
  const [own, setOwn] = useState(null), [hp, setHp] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { if (user === null) router.push('/signin') }, [user])
  function insert(h) {
    const el = ta.current, p = el.selectionStart ?? body.length, b = body.slice(0, p), a = body.slice(p)
    const lead = !b ? '' : b.endsWith('\n\n') ? '' : b.endsWith('\n') ? '\n' : '\n\n'
    const t = lead + '## ' + h + '\n'; setBody(b + t + a)
    const n = (b + t).length; setTimeout(() => { el.focus(); el.setSelectionRange(n, n) }, 0)
  }
  function addOwn() { if (own.trim()) insert(own.trim()); setOwn(null) }
  async function submit() {
    setErr(''); if (hp) return
    if (mode === 'p' && !pen.trim()) return setErr('Please enter a pen name, or choose Anonymous.')
    if (Date.now() - t0.current < 10000) return setErr('Please take a little more time before submitting.')
    setBusy(true)
    const args = { p_title: title.trim(), p_body: body, p_pen_name: mode === 'p' ? pen.trim() : '' }
    const { data, error } = initial ? await supabase.rpc('edit_story', { p_id: initial.id, ...args }) : await supabase.rpc('submit_story', args)
    setBusy(false); if (error) return setErr(error.message); router.push('/story/' + (initial ? initial.id : data))
  }
  if (!user) return <main><p className="sub">Loading…</p></main>
  return (
    <main><h1>{initial ? 'Edit your story' : 'Share your story'}</h1>
      <p className="sub">Your story is anonymous by default and is published as soon as you submit it.</p>
      <div className="card">
        <p className="meta">Tap a heading to add it to your story, or add your own.</p>
        <div className="chips">
          {HEADS.map(h => <button key={h} type="button" className="chip" onClick={() => insert(h)}>+ {h}</button>)}
          <button type="button" className="chip own" onClick={() => setOwn('')}>+ Add my own heading</button>
        </div>
        {own !== null && <div className="row"><input type="text" autoFocus maxLength={60} placeholder="Type your heading" value={own} onChange={e => setOwn(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOwn()} /><button className="btn" onClick={addOwn}>Add</button></div>}
        <input type="text" maxLength={80} placeholder="Story title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea ref={ta} value={body} onChange={e => setBody(e.target.value)} placeholder="Start writing your experience here…" aria-label="Your story" />
        <p className="meta">{body.length} characters · at least 100</p>
        <div className="row" style={{ justifyContent: 'flex-start' }}>
          <label><input type="radio" checked={mode === 'a'} onChange={() => setMode('a')} /> Publish as Anonymous</label>
          <label><input type="radio" checked={mode === 'p'} onChange={() => setMode('p')} /> Publish with a pen name</label>
        </div>
        {mode === 'p' && <input type="text" maxLength={30} placeholder="Pen name (not your real name)" value={pen} onChange={e => setPen(e.target.value)} style={{ marginTop: 8 }} />}
        <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} />
        {err && <p className="err">{err}</p>}
        <div className="row"><span className="meta">Your email is never shown.</span>
          <button className="btn" disabled={busy || title.trim().length < 3 || body.length < 100} onClick={submit}>{initial ? 'Save changes' : 'Publish story'}</button></div>
      </div></main>)
}
