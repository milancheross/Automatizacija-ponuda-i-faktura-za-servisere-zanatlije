'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function signToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, company_name, address, pib, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        company_name: company_name || null,
        address: address || null,
        pib: pib || null,
        phone: phone || null,
      })
      .select('id, email, company_name, logo_url, address, pib, phone, created_at')
      .single();

    if (error) throw error;

    const token = signToken(user.id, user.email);

    return res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, company_name, logo_url, address, pib, phone, expo_push_token, created_at')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...userWithoutPassword } = user;
    const token = signToken(user.id, user.email);

    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
});

// PUT /auth/profile — update profile (authenticated)
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { company_name, logo_url, address, pib, phone, expo_push_token } = req.body;

    const updates = {};
    if (company_name     !== undefined) updates.company_name    = company_name;
    if (logo_url         !== undefined) updates.logo_url        = logo_url;
    if (address          !== undefined) updates.address         = address;
    if (pib              !== undefined) updates.pib             = pib;
    if (phone            !== undefined) updates.phone           = phone;
    if (expo_push_token  !== undefined) updates.expo_push_token = expo_push_token;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select('id, email, company_name, logo_url, address, pib, phone, expo_push_token, created_at')
      .single();

    if (error) throw error;

    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /auth/profile — get current user (authenticated)
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, company_name, logo_url, address, pib, phone, expo_push_token, created_at')
      .eq('id', req.userId)
      .single();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
