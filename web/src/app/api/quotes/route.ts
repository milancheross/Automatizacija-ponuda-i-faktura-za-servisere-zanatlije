import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'
import { v4 as uuidv4 } from 'uuid'

export const GET = withAuth(async (req, userId) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  let query = supabase
    .from('quotes')
    .select('*, client:clients(id,name,phone,email)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return err(error.message, 500)
  return ok({ quotes: data })
})

export const POST = withAuth(async (req, userId) => {
  const body = await req.json()
  const { items, ...quoteData } = body
  const subtotal = (items || []).reduce((s: number, i: any) => s + i.quantity * i.price, 0)
  const discount_amount = subtotal * ((quoteData.discount_percent || 0) / 100)
  const total = subtotal - discount_amount
  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      ...quoteData,
      user_id: userId,
      subtotal,
      discount_amount,
      total_amount: total,
      total,
      status: 'nacrt',
      tracking_token: uuidv4(),
    })
    .select()
    .single()
  if (error) return err(error.message, 500)
  if (items?.length) {
    const { error: itemsError } = await supabase.from('quote_items').insert(
      items.map((i: any) => ({ ...i, quote_id: quote.id, total: i.quantity * i.price }))
    )
    if (itemsError) return err(itemsError.message, 500)
  }
  return ok({ quote }, 201)
})
