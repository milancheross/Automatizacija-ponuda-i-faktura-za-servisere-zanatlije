import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAuth(async (_req, userId, { params }) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(id,name,phone,email,address), items:quote_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()
  if (error) return err('Nije pronađeno', 404)
  return ok({ invoice: data })
})

export const DELETE = withAuth(async (_req, userId, { params }) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId)
  if (error) return err(error.message, 500)
  return ok({ success: true })
})
