-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  company_name     TEXT,
  logo_url         TEXT,
  address          TEXT,
  pib              VARCHAR(20),
  phone            VARCHAR(30),
  expo_push_token  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      VARCHAR(30),
  email      TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRICE ITEMS (catalog)
CREATE TABLE IF NOT EXISTS price_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  unit       VARCHAR(20),
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  category   VARCHAR(50),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUOTES
CREATE TABLE IF NOT EXISTS quotes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id        UUID REFERENCES clients(id) ON DELETE SET NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'draft',
  valid_until      DATE,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  note             TEXT,
  total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  sent_at          TIMESTAMPTZ,
  opened_at        TIMESTAMPTZ,
  tracking_token   UUID UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUOTE ITEMS (line items)
CREATE TABLE IF NOT EXISTS quote_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id   UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  unit       VARCHAR(20),
  quantity   DECIMAL(10,3) NOT NULL DEFAULT 1,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  total      DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_id       UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  issued_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE,
  total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  status         VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_clients_user_id       ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_price_items_user_id   ON price_items(user_id);
CREATE INDEX IF NOT EXISTS idx_price_items_category  ON price_items(category);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id        ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id      ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status         ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_tracking_token ON quotes(tracking_token);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id  ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id      ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id    ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id     ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status       ON invoices(status);

-- ROW LEVEL SECURITY
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices    ENABLE ROW LEVEL SECURITY;

-- RLS Policies: service role bypasses RLS, but we define user-scoped policies too

-- Users: each user can only see/edit their own row
CREATE POLICY users_self ON users
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Clients: scoped to user_id
CREATE POLICY clients_owner ON clients
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Price items: scoped to user_id
CREATE POLICY price_items_owner ON price_items
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Quotes: scoped to user_id (tracking endpoint uses service key)
CREATE POLICY quotes_owner ON quotes
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Quote items: accessible if user owns the parent quote
CREATE POLICY quote_items_owner ON quote_items
  USING (
    quote_id IN (
      SELECT id FROM quotes WHERE user_id = auth.uid()
    )
  );

-- Invoices: scoped to user_id
CREATE POLICY invoices_owner ON invoices
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
