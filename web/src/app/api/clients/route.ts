import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const GET = withAuth(async (_req, userId) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  if (error) return err(error.message, 500)
  return ok({ clients: data })
})

export const POST = withAuth(async (req, userId) => {
  const body = await req.json()
  if (!body.name) return err('Ime je obavezno')
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...body, user_id: userId })
    .select()
    .single()
  if (error) return err(error.message, 500)
  return ok({ client: data }, 201)
})
