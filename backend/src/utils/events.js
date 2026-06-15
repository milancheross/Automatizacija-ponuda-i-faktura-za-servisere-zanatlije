'use strict';
const supabase = require('../db');

async function logEvent(quoteId, userId, eventType, meta = {}) {
  try {
    await supabase.from('quote_events').insert({
      quote_id: quoteId,
      user_id: userId,
      event_type: eventType,
      meta,
    });
  } catch (err) {
    // Event logging is non-critical — never throw
    console.error('Event log error:', err.message);
  }
}

module.exports = { logEvent };
