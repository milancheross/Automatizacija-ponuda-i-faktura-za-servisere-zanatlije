'use strict';
const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /jobs — list all jobs for user
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('jobs')
      .select(`
        id, title, status, scheduled_at, note, created_at, updated_at,
        clients ( id, name, phone ),
        quotes ( id, total_amount )
      `)
      .eq('user_id', req.userId)
      .order('scheduled_at', { ascending: true, nullsFirst: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ jobs: data });
  } catch (err) { next(err); }
});

// GET /jobs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id, title, status, scheduled_at, note, created_at, updated_at,
        clients ( id, name, phone, email, address ),
        quotes ( id, total_amount, discount_percent )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();
    if (error) throw error;
    return res.json({ job: data });
  } catch (err) { next(err); }
});

// POST /jobs — create job (usually from accepted quote)
router.post('/', async (req, res, next) => {
  try {
    const { quote_id, client_id, title, scheduled_at, note } = req.body;
    if (!title || !client_id) {
      return res.status(400).json({ error: 'title and client_id are required' });
    }
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: req.userId,
        quote_id: quote_id || null,
        client_id,
        title,
        status: 'zakazano',
        scheduled_at: scheduled_at || null,
        note: note || null,
      })
      .select('id')
      .single();
    if (error) throw error;
    return res.status(201).json({ job: data });
  } catch (err) { next(err); }
});

// PUT /jobs/:id — update status, date, note
router.put('/:id', async (req, res, next) => {
  try {
    const { status, scheduled_at, note, title } = req.body;
    const allowed = ['zakazano', 'u_toku', 'zavrseno'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updates = { updated_at: new Date().toISOString() };
    if (status)       updates.status = status;
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;
    if (note !== undefined) updates.note = note;
    if (title)        updates.title = title;

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();
    if (error) throw error;
    return res.json({ job: data });
  } catch (err) { next(err); }
});

module.exports = router;
