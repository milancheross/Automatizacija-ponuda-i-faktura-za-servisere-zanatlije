import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAuth(async (_req, userId, { params }) => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(id,name,phone,email,address), items:quote_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()
  if (error) return err('Nije pronađeno', 404)
  return ok({ quote: data })
})

export const PUT = withAuth(async (req, userId, { params }) => {
  const body = await req.json()
  const { data, error } = await supabase
    .from('quotes')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ quote: data })
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
