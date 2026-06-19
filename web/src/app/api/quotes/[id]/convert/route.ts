import { supabase } from '@/lib/supabase'
import { withAuth, ok, err } from '@/lib/api-helpers'

export const POST = withAuth(async (_req, userId, { params }) => {
  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .select('*, items:quote_items(*)')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()
  if (qErr) return err('Ponuda nije pronadjena', 404)

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  const invoiceNumber = `${year}-${String((count || 0) + 1).padStart(4, '0')}`

  const { data: invoice, error: iErr } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      client_id: quote.client_id,
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      status: 'neplaceno',
      total_amount: quote.total_amount,
      issued_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (iErr) return err(iErr.message, 500)

  if (quote.items?.length) {
    await supabase.from('quote_items').insert(
      quote.items.map((i: any) => ({
        invoice_id: invoice.id,
        name: i.name,
        unit: i.unit,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      }))
    )
  }

  await supabase.from('quotes').update({ status: 'prihvacena' }).eq('id', quote.id)

  return ok({ invoice }, 201)
})
