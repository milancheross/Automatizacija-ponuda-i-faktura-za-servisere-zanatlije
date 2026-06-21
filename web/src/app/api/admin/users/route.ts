export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAdminAuth(async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get('q') || ''

  let query = supabase
    .from('users')
    .select('id, email, company_name, plan, subscription_status, role, created_at, last_active_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) {
    query = query.ilike('email', `%${q}%`)
  }

  const { data: users, error } = await query
  if (error) return err('DB greška', 500)

  // Fetch counts per user
  const ids = (users || []).map(u => u.id)
  const [{ data: qCounts }, { data: iCounts }] = await Promise.all([
    supabase.from('quotes').select('user_id').in('user_id', ids),
    supabase.from('invoices').select('user_id').in('user_id', ids),
  ])

  const quoteCounts: Record<string, number> = {}
  const invoiceCounts: Record<string, number> = {}
  for (const q of qCounts || []) quoteCounts[q.user_id] = (quoteCounts[q.user_id] || 0) + 1
  for (const i of iCounts || []) invoiceCounts[i.user_id] = (invoiceCounts[i.user_id] || 0) + 1

  const enriched = (users || []).map(u => ({
    ...u,
    quote_count: quoteCounts[u.id] || 0,
    invoice_count: invoiceCounts[u.id] || 0,
  }))

  return ok({ users: enriched })
})
