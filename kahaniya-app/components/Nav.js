'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'

export default function Nav() {
  const user = useUser()
  const path = usePathname()
  const [open, setOpen] = useState(false)

  // close the mobile menu after moving to another page
  useEffect(() => { setOpen(false) }, [path])

  const isActive = href => href === '/' ? (path === '/' || path.startsWith('/story')) : path.startsWith(href)
  const item = (href, label) => <Link href={href} className={'navlink' + (isActive(href) ? ' active' : '')}>{label}</Link>

  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand"><span className="logo" aria-hidden="true">K</span>Kahaniya</Link>

        <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav className={'menu' + (open ? ' open' : '')}>
          <div className="menu-links">
            {item('/', 'Stories')}
            {user && item('/mine', 'My stories')}
          </div>
          <div className="menu-actions">
            {user
              ? <button type="button" className="navlink" onClick={() => supabase.auth.signOut()}>Sign out</button>
              : <Link href="/signin" className={'navlink' + (isActive('/signin') ? ' active' : '')}>Sign in</Link>}
            <Link href="/write" className="btn cta">Share your story</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
