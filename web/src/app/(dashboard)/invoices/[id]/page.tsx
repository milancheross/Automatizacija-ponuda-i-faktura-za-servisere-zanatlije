'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [editDueDate, setEditDueDate] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)

  useEffect(() => {
    fetch(`/api/invoices/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setInvoice(d.invoice)
        setDueDate(d.invoice?.due_date ? d.invoice.due_date.split('T')[0] : '')
        setLoading(false)
      })
  }, [id])

  async function handleMarkPaid() {
    if (!confirm('Označiti fakturu kao plaćenu?')) return
    setActing(true)
    const r = await fetch(`/api/invoices/${id}/pay`, { method: 'POST', credentials: 'include' })
    const d = await r.json()
    setInvoice(d.invoice)
    setActing(false)
  }

  async function handleSaveDueDate() {
    setSavingDate(true)
    const r = await fetch(`/api/invoices/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due_date: dueDate || null }),
    })
    const d = await r.json()
    if (r.ok) setInvoice(d.invoice)
    setEditDueDate(false)
    setSavingDate(false)
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Učitavanje...</div>
  if (!invoice) return <div className="p-6 text-gray-400 text-sm">Faktura nije pronađena</div>

  const canEdit = invoice.status === 'neplaceno'

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-blue-600 text-sm mb-4 hover:underline print:hidden">← Nazad</button>

      <div className="bg-[#1e3a8a] text-white rounded-2xl p-5 md:p-6 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-blue-300 text-xs font-bold tracking-widest mb-1">FAKTURA</div>
            <div className="font-bold text-xl">#{invoice.invoice_number}</div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="text-2xl md:text-3xl font-bold mb-2">{(invoice.total || 0).toLocaleString('sr-RS')} RSD</div>
        <div className="text-blue-200 text-sm">
          Izdato: {new Date(invoice.issued_at).toLocaleDateString('sr-RS')}
          {invoice.due_date && ` • Rok: ${new Date(invoice.due_date).toLocaleDateString('sr-RS')}`}
        </div>
        {invoice.status === 'placeno' && (
          <div className="text-green-300 text-sm mt-1">✓ Plaćeno</div>
        )}
      </div>

      {invoice.client && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-3 shadow-sm">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Klijent</div>
          <div className="font-semibold">{invoice.client.name}</div>
          {invoice.client.phone && <div className="text-sm text-gray-500 mt-1">📞 {invoice.client.phone}</div>}
          {invoice.client.email && <div className="text-sm text-gray-500">✉ {invoice.client.email}</div>}
        </div>
      )}

      {/* Due date edit */}
      {canEdit && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Rok plaćanja</div>
              <div className="text-sm text-gray-700">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('sr-RS') : <span className="text-gray-400">Nije postavljen</span>}
              </div>
            </div>
            {!editDueDate && (
              <button onClick={() => setEditDueDate(true)} className="text-blue-500 text-sm font-medium hover:text-blue-700">✏️ Izmeni</button>
            )}
          </div>
          {editDueDate && (
            <div className="flex gap-2 mt-3">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <button onClick={handleSaveDueDate} disabled={savingDate}
                className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
                {savingDate ? '...' : 'Sačuvaj'}
              </button>
              <button onClick={() => setEditDueDate(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600">X</button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-3 shadow-sm">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Stavke</div>
        <div className="space-y-2">
          {(invoice.items || []).map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-400">{item.quantity} {item.unit} × {Number(item.price).toLocaleString('sr-RS')} RSD</div>
              </div>
              <div className="font-semibold shrink-0 ml-3">{Number(item.total).toLocaleString('sr-RS')} RSD</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between font-bold border-t pt-3">
          <span>UKUPNO</span><span className="text-[#2563EB]">{(invoice.total || 0).toLocaleString('sr-RS')} RSD</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        {canEdit && (
          <button onClick={handleMarkPaid} disabled={acting}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-60">
            {acting ? '...' : '✓ Označi kao plaćeno'}
          </button>
        )}
        <a href={`/api/invoices/${id}/pdf`} target="_blank"
          className="flex-1 sm:flex-none border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 text-center">
          📄 PDF
        </a>
        <button onClick={() => window.print()}
          className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50">
          🖸 Štampaj
        </button>
      </div>
    </div>
  )
}
