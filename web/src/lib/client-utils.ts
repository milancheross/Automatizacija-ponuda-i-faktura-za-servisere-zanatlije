export const LEGAL_FORM_LABELS: Record<string, string> = {
  doo: 'DOO',
  entrepreneur: 'Preduzetnik',
  other: 'Ostalo',
  unknown: 'Nepoznato',
}

export const VAT_STATUS_LABELS: Record<string, string> = {
  in_vat: 'U sistemu PDV-a',
  out_of_vat: 'Nije u sistemu PDV-a',
  unknown: 'Nepoznato',
}

export const ENTREPRENEUR_TAX_MODE_LABELS: Record<string, string> = {
  lump_sum: 'Paušalac',
  books: 'Knjigaš',
  unknown: 'Nepoznato',
}

export function clientDisplayName(client: { name?: string; company_name?: string; client_type?: string } | null | undefined): string {
  if (!client) return '—'
  if (client.client_type === 'business') return client.company_name || client.name || '—'
  return client.name || '—'
}
