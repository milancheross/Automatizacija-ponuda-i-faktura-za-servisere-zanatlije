'use strict';

const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /clients
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', req.userId)
      .order('name', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return next(error);

    return res.json({ clients: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /clients/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) return next(error);
    if (!data) return res.status(404).json({ error: 'Client not found' });

    return res.json({ client: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /clients
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: req.userId,
        name: name.trim(),
        phone: phone || null,
        email: email ? email.toLowerCase().trim() : null,
        address: address || null,
      })
      .select('*')
      .single();

    if (error) return next(error);

    return res.status(201).json({ client: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /clients/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    // Verify ownership first
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Client not found' });

    const allowed = ['name', 'phone', 'email', 'address'];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      return res.status(400).json({ error: 'name cannot be empty' });
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('*')
      .single();

    if (error) return next(error);

    return res.json({ client: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /clients/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Client not found' });

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) return next(error);

    return res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
