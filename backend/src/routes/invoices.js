'use strict';

const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /invoices
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('invoices')
      .select(`
        id, invoice_number, issued_at, due_date, total_amount,
        status, created_at, quote_id,
        clients ( id, name, phone, email )
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const normalized = (data || []).map(inv => ({
      ...inv,
      client_id: inv.clients?.id ?? null,
      client: inv.clients ?? null,
      total: inv.total_amount,
      due_at: inv.due_date,
      clients: undefined,
    }));

    return res.json({ invoices: normalized });
  } catch (err) {
    next(err);
  }
});

// GET /invoices/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients ( id, name, phone, email, address )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    let items = [];
    if (invoice.quote_id) {
      const { data: quoteItems, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', invoice.quote_id);
      if (itemsError) throw itemsError;
      items = (quoteItems || []).map(i => ({ ...i, unit_price: i.price }));
    }

    const normalized = {
      ...invoice,
      client_id: invoice.clients?.id ?? invoice.client_id ?? null,
      client: invoice.clients ?? null,
      total: invoice.total_amount,
      subtotal: invoice.total_amount,
      discount_amount: 0,
      due_at: invoice.due_date,
      items,
      clients: undefined,
    };

    return res.json({ invoice: normalized });
  } catch (err) {
    next(err);
  }
});

// POST /invoices/:id/pay  (mobile calls this)
router.post('/:id/pay', async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ invoice: { ...invoice, total: invoice.total_amount } });
  } catch (err) {
    next(err);
  }
});

// PUT /invoices/:id/mark-paid  (legacy)
router.put('/:id/mark-paid', async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ invoice: { ...invoice, total: invoice.total_amount } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
