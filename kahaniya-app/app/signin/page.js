'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export default function SignIn() {
  const router = useRouter(), [up, setUp] = useState(false), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function go() {
    setErr(''); if (up && pw.length < 8) return setErr('Password must be at least 8 characters.')
    setBusy(true)
    const f = up ? supabase.auth.signUp : supabase.auth.signInWithPassword
    const { data, error } = await f.call(supabase.auth, { email: email.trim(), password: pw })
    setBusy(false); if (error) return setErr(error.message)
    if (up && !data.session) return setErr('Account created. Check your email to confirm it, then sign in.')
    router.push('/write')
  }
  return (<main><h1>Welcome to Kahaniya</h1><p className="sub">Sign in or create an account to share your story. Your email is never shown publicly.</p>
    <div className="card"><div className="chips"><button className="chip" onClick={() => setUp(false)}>Sign in</button><button className="chip" onClick={() => setUp(true)}>Create account</button></div>
      <input type="email" placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password (at least 8 characters)" autoComplete={up ? 'new-password' : 'current-password'} value={pw} onChange={e => setPw(e.target.value)} />
      {err && <p className="err">{err}</p>}<button className="btn" disabled={busy || !email || !pw} onClick={go}>{up ? 'Create account' : 'Sign in'}</button></div></main>)
}
