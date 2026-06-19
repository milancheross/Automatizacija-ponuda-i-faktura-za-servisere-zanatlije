import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAuth(async (_req, userId, { params }) => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(id,name,phone,email,address), items:quote_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()
  if (error) return err('Nije pronadjeno', 404)
  return ok({ quote: { ...data, total: data.total_amount, subtotal: data.total_amount / (1 - (data.discount_percent || 0) / 100) } })
})

export const PUT = withAuth(async (req, userId, { params }) => {
  const body = await req.json()
  // only update allowed columns
  const allowed = ['status', 'note', 'valid_until', 'discount_percent', 'total_amount', 'sent_at', 'opened_at']
  const update: Record<string, any> = {}
  for (const key of allowed) if (key in body) update[key] = body[key]
  const { data, error } = await supabase
    .from('quotes')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ quote: { ...data, total: data.total_amount } })
})

export const DELETE = withAuth(async (_req, userId, { params }) => {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId)
  if (error) return err(error.message, 500)
  return ok({ success: true })
})
