'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
// undefined = loading, null = signed out
export function useUser() {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])
  return user
}
