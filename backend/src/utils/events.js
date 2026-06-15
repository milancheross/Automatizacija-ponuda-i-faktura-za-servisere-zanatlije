'use strict';
const supabase = require('../db');

// Fire-and-forget event logger — never throws
async function logEvent(quoteId, userId, eventType, meta = {}) {
  try {
    await supabase.from('quote_events').insert({
      quote_id: quoteId || null,
      user_id: userId,
      event_type: eventType,
      meta,
    });
  } catch (err) {
    console.error('Event log error:', err.message);
  }
}

// Log event only if this is the FIRST occurrence for this user+eventType
async function logFirstEvent(userId, eventType, meta = {}) {
  try {
    const { count } = await supabase
      .from('quote_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_type', eventType);

    if (count === 0) {
      await supabase.from('quote_events').insert({
        quote_id: null,
        user_id: userId,
        event_type: eventType,
        meta,
      });
    }
  } catch (err) {
    console.error('First event log error:', err.message);
  }
}

module.exports = { logEvent, logFirstEvent };
