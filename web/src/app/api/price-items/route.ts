import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAuth(async (_req, userId) => {
  const { data, error } = await supabase
    .from('price_items')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  if (error) return err(error.message, 500)
  return ok({ items: data })
})

export const POST = withAuth(async (req, userId) => {
  const body = await req.json()
  if (!body.name || !body.price) return err('Naziv i cena su obavezni')
  const { data, error } = await supabase
    .from('price_items')
    .insert({ ...body, user_id: userId, is_active: true })
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ item: data }, 201)
})
