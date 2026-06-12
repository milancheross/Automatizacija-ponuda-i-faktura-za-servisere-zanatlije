'use strict';

const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /clients — list all clients for authenticated user
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', req.userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return res.json({ clients: data });
  } catch (err) {
    next(err);
  }
});

// GET /clients/:id — get single client
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Client not found' });

    return res.json({ client: data });
  } catch (err) {
    next(err);
  }
});

// POST /clients — create client
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: req.userId,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ client: data });
  } catch (err) {
    next(err);
  }
});

// PUT /clients/:id — update client
router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const updates = {};
    if (name    !== undefined) updates.name    = name;
    if (phone   !== undefined) updates.phone   = phone;
    if (email   !== undefined) updates.email   = email;
    if (address !== undefined) updates.address = address;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Ensure the client belongs to this user
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Client not found' });

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ client: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /clients/:id — delete client
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
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
