import { createClient } from '@supabase/supabase-js'
export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data } = await admin.auth.getUser(token)
  if (!data?.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
  // A database trigger deletes this person's stories first
  const { error } = await admin.auth.admin.deleteUser(data.user.id)
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true })
}
