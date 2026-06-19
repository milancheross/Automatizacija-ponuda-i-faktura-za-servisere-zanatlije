import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const PUT = withAuth(async (req, userId, { params }) => {
  const body = await req.json()
  const { data, error } = await supabase
    .from('price_items')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ item: data })
})

export const DELETE = withAuth(async (_req, userId, { params }) => {
  const { error } = await supabase
    .from('price_items')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId)
  if (error) return err(error.message, 500)
  return ok({ success: true })
})
