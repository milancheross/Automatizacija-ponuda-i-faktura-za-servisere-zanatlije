'use strict';

const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /invoices — list all invoices for user with client name
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

    return res.json({ invoices: data });
  } catch (err) {
    next(err);
  }
});

// GET /invoices/:id — invoice details with line items from associated quote
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

    // Fetch line items from quote_items if a quote is linked
    let items = [];
    if (invoice.quote_id) {
      const { data: quoteItems, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', invoice.quote_id);

      if (itemsError) throw itemsError;
      items = quoteItems || [];
    }

    return res.json({ invoice: { ...invoice, items } });
  } catch (err) {
    next(err);
  }
});

// PUT /invoices/:id/mark-paid — mark invoice as paid
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
      .update({ status: 'paid' })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ invoice });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
