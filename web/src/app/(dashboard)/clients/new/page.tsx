'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ClientType = 'person' | 'business'

const FIELD = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]'
const SELECT = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]'
const LABEL = 'block text-sm font-medium text-gray-700 mb-1'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2 pb-1 border-b border-gray-100">{title}</div>
}

export default function NewClientPage() {
  const router = useRouter()
  const [clientType, setClientType] = useState<ClientType>('person')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [personForm, setPersonForm] = useState({
    name: '', phone: '', email: '', address: '', notes: '',
  })

  const [bizForm, setBizForm] = useState({
    name: '',
    contact_person: '', phone: '', email: '',
    tax_id: '', registration_number: '',
    billing_address: '', job_site_address: '',
    legal_form: 'unknown', vat_status: 'unknown', entrepreneur_tax_mode: 'unknown',
    notes: '',
  })

  function setPerson(key: string, val: string) { setPersonForm(f => ({ ...f, [key]: val })) }
  function setBiz(key: string, val: string) { setBizForm(f => ({ ...f, [key]: val })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = clientType === 'person'
      ? { client_type: 'person', ...personForm }
      : {
          client_type: 'business',
          name: bizForm.name,
          company_name: bizForm.name,
          contact_person: bizForm.contact_person,
          phone: bizForm.phone,
          email: bizForm.email,
          tax_id: bizForm.tax_id,
          registration_number: bizForm.registration_number,
          billing_address: bizForm.billing_address,
          job_site_address: bizForm.job_site_address,
          legal_form: bizForm.legal_form,
          vat_status: bizForm.vat_status,
          entrepreneur_tax_mode: bizForm.entrepreneur_tax_mode,
          notes: bizForm.notes,
        }

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Greška pri čuvanju'); setSaving(false); return }
    router.push(`/clients/${data.id}`)
  }

  return (
    <div className="p-4 md:p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="text-gray-500 hover:text-gray-700">← Nazad</Link>
        <h1 className="text-xl font-bold text-gray-900">Novi klijent</h1>
      </div>

      {/* Type selector */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Tip klijenta</div>
        <div className="grid grid-cols-2 gap-2">
          {([['person', '👤 Fizičko lice'], ['business', '🏢 Firma / preduzetnik']] as const).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setClientType(type)}
              className={`py-3 px-4 rounded-xl font-medium text-sm border-2 transition-colors ${
                clientType === type
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {clientType === 'person' ? (
          <>
            <Field label="Ime i prezime *">
              <input required value={personForm.name} onChange={e => setPerson('name', e.target.value)} className={FIELD} placeholder="npr. Petar Nikolić" />
            </Field>
            <Field label="Telefon">
              <input type="tel" value={personForm.phone} onChange={e => setPerson('phone', e.target.value)} className={FIELD} placeholder="+381 60 123 4567" />
            </Field>
            <Field label="Email">
              <input type="email" value={personForm.email} onChange={e => setPerson('email', e.target.value)} className={FIELD} />
            </Field>
            <Field label="Adresa">
              <input value={personForm.address} onChange={e => setPerson('address', e.target.value)} className={FIELD} placeholder="Ulica i broj, grad" />
            </Field>
            <Field label="Napomena">
              <textarea value={personForm.notes} onChange={e => setPerson('notes', e.target.value)} className={FIELD} rows={2} />
            </Field>
          </>
        ) : (
          <>
            <SectionHeader title="Poslovni podaci" />
            <Field label="Naziv firme / radnje *">
              <input required value={bizForm.name} onChange={e => setBiz('name', e.target.value)} className={FIELD} placeholder="npr. Elektro Nikolić d.o.o." />
            </Field>
            <Field label="PIB" hint="Poreski identifikacioni broj (9 cifara)">
              <input value={bizForm.tax_id} onChange={e => setBiz('tax_id', e.target.value)} className={FIELD} placeholder="123456789" />
            </Field>
            <Field label="Matični broj">
              <input value={bizForm.registration_number} onChange={e => setBiz('registration_number', e.target.value)} className={FIELD} placeholder="12345678" />
            </Field>
            <Field label="Adresa sedišta / za fakturisanje">
              <input value={bizForm.billing_address} onChange={e => setBiz('billing_address', e.target.value)} className={FIELD} placeholder="Ulica i broj, grad" />
            </Field>

            <SectionHeader title="Kontakt" />
            <Field label="Kontakt osoba">
              <input value={bizForm.contact_person} onChange={e => setBiz('contact_person', e.target.value)} className={FIELD} placeholder="npr. Petar Nikolić" />
            </Field>
            <Field label="Telefon">
              <input type="tel" value={bizForm.phone} onChange={e => setBiz('phone', e.target.value)} className={FIELD} placeholder="+381 60 123 4567" />
            </Field>
            <Field label="Email">
              <input type="email" value={bizForm.email} onChange={e => setBiz('email', e.target.value)} className={FIELD} />
            </Field>

            <SectionHeader title="Dodatno" />
            <Field label="Pravni oblik">
              <select value={bizForm.legal_form} onChange={e => setBiz('legal_form', e.target.value)} className={SELECT}>
                <option value="unknown">Nepoznato</option>
                <option value="doo">DOO</option>
                <option value="entrepreneur">Preduzetnik</option>
                <option value="other">Ostalo</option>
              </select>
            </Field>

            {bizForm.legal_form === 'entrepreneur' && (
              <Field label="Tip preduzetnika">
                <select value={bizForm.entrepreneur_tax_mode} onChange={e => setBiz('entrepreneur_tax_mode', e.target.value)} className={SELECT}>
                  <option value="unknown">Nepoznato</option>
                  <option value="lump_sum">Paušalac</option>
                  <option value="books">Knjigaš</option>
                </select>
              </Field>
            )}

            <Field label="PDV status">
              <select value={bizForm.vat_status} onChange={e => setBiz('vat_status', e.target.value)} className={SELECT}>
                <option value="unknown">Nepoznato</option>
                <option value="in_vat">U sistemu PDV-a</option>
                <option value="out_of_vat">Nije u sistemu PDV-a</option>
              </select>
            </Field>

            <SectionHeader title="Objekat / radovi" />
            <Field label="Adresa objekta / mesta izvođenja radova">
              <input value={bizForm.job_site_address} onChange={e => setBiz('job_site_address', e.target.value)} className={FIELD} placeholder="Adresa gde se izvode radovi" />
            </Field>

            <SectionHeader title="Napomena" />
            <Field label="">
              <textarea value={bizForm.notes} onChange={e => setBiz('notes', e.target.value)} className={FIELD} rows={2} placeholder="Interne napomene..." />
            </Field>
          </>
        )}

        <button type="submit" disabled={saving}
          className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 mt-2">
          {saving ? 'Čuvanje...' : 'Sačuvaj klijenta'}
        </button>
      </form>
    </div>
  )
}
