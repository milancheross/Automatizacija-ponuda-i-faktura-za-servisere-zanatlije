'use strict';

const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /price-items
// Query params: category, include_inactive (default: false)
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { category, include_inactive, search } = req.query;

    let query = supabase
      .from('price_items')
      .select('*')
      .eq('user_id', req.userId)
      .order('name', { ascending: true });

    // By default, only return active items
    if (include_inactive !== 'true') {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) return next(error);

    return res.json({ price_items: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /price-items/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('price_items')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) return next(error);
    if (!data) return res.status(404).json({ error: 'Price item not found' });

    return res.json({ price_item: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /price-items
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { name, unit, price, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ error: 'price is required and must be a number' });
    }

    const { data, error } = await supabase
      .from('price_items')
      .insert({
        user_id: req.userId,
        name: name.trim(),
        unit: unit || null,
        price: Number(price),
        category: category || null,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) return next(error);

    return res.status(201).json({ price_item: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /price-items/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('price_items')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Price item not found' });

    const allowed = ['name', 'unit', 'price', 'category', 'is_active'];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return res.status(400).json({ error: 'name cannot be empty' });
    }

    if (updates.price !== undefined) {
      if (isNaN(Number(updates.price))) {
        return res.status(400).json({ error: 'price must be a number' });
      }
      updates.price = Number(updates.price);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    const { data, error } = await supabase
      .from('price_items')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('*')
      .single();

    if (error) return next(error);

    return res.json({ price_item: data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /price-items/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('price_items')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Price item not found' });

    const { error } = await supabase
      .from('price_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) return next(error);

    return res.json({ message: 'Price item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
