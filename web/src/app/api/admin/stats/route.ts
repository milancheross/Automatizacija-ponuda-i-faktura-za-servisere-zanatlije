export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const now = new Date()
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: total_users },
    { count: new_users_7d },
    { count: active_users_7d },
    { count: total_quotes },
    { count: total_invoices },
    { count: pro_users },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', since7d),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('last_active_at', since7d),
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'pro').eq('subscription_status', 'active'),
  ])

  return ok({ total_users, new_users_7d, active_users_7d, total_quotes, total_invoices, pro_users })
})
