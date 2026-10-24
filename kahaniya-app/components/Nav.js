'use client'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
export default function Nav() {
  const user = useUser()
  return (
    <nav><Link className="brand" href="/">Kahaniya</Link>
      <div className="links"><Link href="/">Stories</Link><Link href="/write">Share yours</Link>
        {user ? <><Link href="/mine">My stories</Link><a href="#" onClick={e => { e.preventDefault(); supabase.auth.signOut() }}>Sign out</a></> : <Link href="/signin">Sign in</Link>}
      </div></nav>)
}
