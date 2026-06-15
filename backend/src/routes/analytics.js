'use strict';
const express = require('express');
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /analytics/funnel — conversion funnel data for dashboard
router.get('/funnel', async (req, res, next) => {
  try {
    const { data: events, error } = await supabase
      .from('quote_events')
      .select('event_type')
      .eq('user_id', req.userId);

    if (error) throw error;

    const counts = {
      quote_created: 0,
      quote_sent: 0,
      quote_opened: 0,
      quote_accepted: 0,
      quote_declined: 0,
    };

    for (const e of events || []) {
      if (counts[e.event_type] !== undefined) counts[e.event_type]++;
    }

    // Also get current quote stats directly for accuracy
    const { data: quotes } = await supabase
      .from('quotes')
      .select('status, opened_at, sent_at')
      .eq('user_id', req.userId);

    const direct = {
      sent: 0, opened: 0, accepted: 0, declined: 0,
    };
    for (const q of quotes || []) {
      if (['sent', 'accepted', 'declined'].includes(q.status)) direct.sent++;
      if (q.opened_at) direct.opened++;
      if (q.status === 'accepted') direct.accepted++;
      if (q.status === 'declined') direct.declined++;
    }

    return res.json({
      events: counts,
      funnel: {
        sent: direct.sent,
        opened: direct.opened,
        accepted: direct.accepted,
        declined: direct.declined,
        open_rate: direct.sent > 0 ? Math.round((direct.opened / direct.sent) * 100) : 0,
        accept_rate: direct.opened > 0 ? Math.round((direct.accepted / direct.opened) * 100) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
