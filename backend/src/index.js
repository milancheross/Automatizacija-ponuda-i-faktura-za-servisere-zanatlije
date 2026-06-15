'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes       = require('./routes/auth');
const clientsRoutes    = require('./routes/clients');
const priceItemsRoutes = require('./routes/priceItems');
const quotesRoutes     = require('./routes/quotes');
const invoicesRoutes   = require('./routes/invoices');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Serve client-facing tracking portal HTML (browser) or JSON (API clients)
// GET /q/:token  → serves portal.html (browser opens this link from SMS/Viber)
// The portal.html JS then fetches /q/:token with fetch() to get the JSON data
app.get('/q/:token', (req, res, next) => {
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  if (acceptsHtml) {
    return res.sendFile(path.join(__dirname, '../public/portal.html'));
  }
  // API call from portal.html's JS fetch()
  req.url = `/track/${req.params.token}`;
  quotesRoutes(req, res, next);
});

// POST /q/:token/respond — client accepts or declines (called from portal.html)
app.post('/q/:token/respond', (req, res, next) => {
  req.url = `/track/${req.params.token}/respond`;
  quotesRoutes(req, res, next);
});

// Auth routes (register, login, profile)
app.use('/auth', authRoutes);

// Protected resource routes
app.use('/clients',     clientsRoutes);
app.use('/price-items', priceItemsRoutes);
app.use('/quotes',      quotesRoutes);
app.use('/invoices',    invoicesRoutes);

// Root health-check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', app: 'Servis Ponuda API', version: '1.0.0' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servis Ponuda API listening on port ${PORT}`);
});

module.exports = app;
