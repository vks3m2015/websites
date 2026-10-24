'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PasswordField from '@/components/PasswordField'

export default function SignIn() {
  const router = useRouter()
  const [up, setUp] = useState(false)          // false = sign in, true = sign up
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  function switchMode(v) { setUp(v); setErr(''); setInfo('') }

  async function go(e) {
    e.preventDefault(); setErr(''); setInfo('')
    if (up && pw.length < 8) return setErr('Password must be at least 8 characters.')
    setBusy(true)
    const f = up ? supabase.auth.signUp : supabase.auth.signInWithPassword
    const { data, error } = await f.call(supabase.auth, { email: email.trim(), password: pw })
    setBusy(false)
    if (error) return setErr(error.message)
    if (up && !data.session) return setInfo('Account created. Check your email to confirm it, then sign in.')
    router.push('/write')
  }

  return (
    <main className="auth">
      <h1>{up ? 'Create your account' : 'Welcome back'}</h1>
      <p className="sub">{up ? 'Sign up to share your story.' : 'Sign in to share or manage your stories.'} Your email is never shown publicly.</p>
      <form className="card" onSubmit={go}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <PasswordField id="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={up ? 'At least 8 characters' : 'Your password'} autoComplete={up ? 'new-password' : 'current-password'} />

        {err && <p className="err">{err}</p>}
        {info && <p className="okmsg">{info}</p>}

        <button className="btn auth-btn" type="submit" disabled={busy || !email || !pw}>{busy ? 'Please wait…' : up ? 'Create account' : 'Sign in'}</button>

        <p className="switch">
          {up ? 'Already have an account? ' : 'Don’t have an account? '}
          <button type="button" className="linkbtn" onClick={() => switchMode(!up)}>{up ? 'Sign in' : 'Sign up'}</button>
        </p>
      </form>
    </main>
  )
}
