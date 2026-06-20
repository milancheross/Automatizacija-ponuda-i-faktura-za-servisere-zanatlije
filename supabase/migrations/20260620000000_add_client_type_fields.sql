-- Add client type classification and business fields to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS client_type text NOT NULL DEFAULT 'person'
    CHECK (client_type IN ('person', 'business')),
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS billing_address text,
  ADD COLUMN IF NOT EXISTS job_site_address text,
  ADD COLUMN IF NOT EXISTS legal_form text DEFAULT 'unknown'
    CHECK (legal_form IN ('doo', 'entrepreneur', 'other', 'unknown')),
  ADD COLUMN IF NOT EXISTS vat_status text DEFAULT 'unknown'
    CHECK (vat_status IN ('in_vat', 'out_of_vat', 'unknown')),
  ADD COLUMN IF NOT EXISTS entrepreneur_tax_mode text DEFAULT 'unknown'
    CHECK (entrepreneur_tax_mode IN ('lump_sum', 'books', 'unknown')),
  ADD COLUMN IF NOT EXISTS notes text;

-- Existing rows get client_type = 'person' by default (already covered by DEFAULT above)
-- No data is destroyed -- all existing name/phone/email/address values are preserved
