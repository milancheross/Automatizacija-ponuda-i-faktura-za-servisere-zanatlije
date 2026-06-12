'use strict';

const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /price-items — list price items for user (optionally filter by category, active only by default)
router.get('/', async (req, res, next) => {
  try {
    const { category, include_inactive } = req.query;

    let query = supabase
      .from('price_items')
      .select('*')
      .eq('user_id', req.userId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (!include_inactive || include_inactive === 'false') {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ price_items: data });
  } catch (err) {
    next(err);
  }
});

// GET /price-items/:id — single item
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('price_items')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Price item not found' });

    return res.json({ price_item: data });
  } catch (err) {
    next(err);
  }
});

// POST /price-items — create
router.post('/', async (req, res, next) => {
  try {
    const { name, unit, price, category } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'price is required' });
    }

    const { data, error } = await supabase
      .from('price_items')
      .insert({
        user_id:  req.userId,
        name,
        unit:     unit     || null,
        price:    parseFloat(price),
        category: category || null,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ price_item: data });
  } catch (err) {
    next(err);
  }
});

// PUT /price-items/:id — update (can toggle is_active)
router.put('/:id', async (req, res, next) => {
  try {
    const { name, unit, price, category, is_active } = req.body;

    const updates = {};
    if (name      !== undefined) updates.name      = name;
    if (unit      !== undefined) updates.unit      = unit;
    if (price     !== undefined) updates.price     = parseFloat(price);
    if (category  !== undefined) updates.category  = category;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: existing } = await supabase
      .from('price_items')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (!existing) return res.status(404).json({ error: 'Price item not found' });

    const { data, error } = await supabase
      .from('price_items')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ price_item: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /price-items/:id — hard delete
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
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ message: 'Price item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
