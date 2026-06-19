import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAuth(async (_req, userId, { params }) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(id,name,phone,email,address)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()
  if (error) return err('Nije pronadjeno', 404)

  let items: any[] = []
  if (data.quote_id) {
    const { data: qItems } = await supabase.from('quote_items').select('*').eq('quote_id', data.quote_id)
    items = qItems || []
  }

  return ok({ invoice: { ...data, total: data.total_amount, items } })
})

export const PUT = withAuth(async (req, userId, { params }) => {
  const body = await req.json()
  const allowed = ['due_date', 'status']
  const update: Record<string, any> = {}
  for (const key of allowed) if (key in body) update[key] = body[key]
  const { data, error } = await supabase
    .from('invoices')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ invoice: { ...data, total: data.total_amount } })
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
