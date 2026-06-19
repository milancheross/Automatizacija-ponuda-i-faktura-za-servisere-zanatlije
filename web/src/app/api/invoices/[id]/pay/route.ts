import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const POST = withAuth(async (_req, userId, { params }) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'placeno', paid_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ invoice: data })
})
