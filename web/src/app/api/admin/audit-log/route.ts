export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth, ok, err } from '@/lib/api-helpers'

const PAGE_SIZE = 50

export const GET = withAdminAuth(async (req: NextRequest) => {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const { data: logs, error, count } = await supabase
    .from('admin_audit_log')
    .select(`
      id, action_type, metadata, created_at,
      admin_user_id, target_user_id
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (error) return err('DB greška', 500)

  // Enrich with emails
  const adminIds = [...new Set((logs || []).map(l => l.admin_user_id).filter(Boolean))]
  const targetIds = [...new Set((logs || []).map(l => l.target_user_id).filter(Boolean))]
  const allIds = [...new Set([...adminIds, ...targetIds])]

  let emailMap: Record<string, string> = {}
  if (allIds.length > 0) {
    const { data: users } = await supabase.from('users').select('id, email').in('id', allIds)
    for (const u of users || []) emailMap[u.id] = u.email
  }

  const enriched = (logs || []).map(l => ({
    ...l,
    admin_email: l.admin_user_id ? emailMap[l.admin_user_id] : null,
    target_email: l.target_user_id ? emailMap[l.target_user_id] : null,
  }))

  return ok({ logs: enriched, total: count ?? 0 })
})
