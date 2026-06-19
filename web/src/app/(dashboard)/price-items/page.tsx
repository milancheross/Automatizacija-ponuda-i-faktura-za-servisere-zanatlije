'use client'

import { useState, useEffect } from 'react'
import EmptyState from '@/components/EmptyState'

type Category = 'rad' | 'materijal' | 'ostalo'
const CATS = [{ value: '', label: 'Sve' }, { value: 'rad', label: 'Rad' }, { value: 'materijal', label: 'Materijal' }, { value: 'ostalo', label: 'Ostalo' }]
const CAT_COLORS: Record<string, string> = { rad: 'bg-blue-100 text-blue-700', materijal: 'bg-orange-100 text-orange-700', ostalo: 'bg-gray-100 text-gray-600' }

export default function PriceItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [cat, setCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ name: '', unit: 'kom', price: '', category: 'ostalo' as Category })
  const [saving, setSaving] = useState(false)

  async function load() {
    const r = await fetch('/api/price-items', { credentials: 'include' })
    const d = await r.json()
    const all = d.items || []
    setItems(cat ? all.filter((i: any) => i.category === cat) : all)
    setLoading(false)
  }

  useEffect(() => { load() }, [cat])

  function openCreate() { setEditItem(null); setForm({ name: '', unit: 'kom', price: '', category: 'ostalo' }); setShowForm(true) }
  function openEdit(item: any) { setEditItem(item); setForm({ name: item.name, unit: item.unit, price: String(item.price), category: item.category }); setShowForm(true) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const body = { ...form, price: Number(form.price) }
    if (editItem) {
      await fetch(`/api/price-items/${editItem.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/price-items', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setShowForm(false); setSaving(false); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati stavku?')) return
    await fetch(`/api/price-items/${id}`, { method: 'DELETE', credentials: 'include' })
    setItems(p => p.filter(i => i.id !== id))
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Cenovnik</h1>
        <button onClick={openCreate} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">+ Nova stavka</button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {CATS.map(c => (
          <button key={c.value} onClick={() => setCat(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              cat === c.value ? 'bg-[#2563EB] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{c.label}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm">
          <h2 className="font-semibold mb-4">{editItem ? 'Izmeni stavku' : 'Nova stavka'}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Naziv *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" placeholder="npr. Postavljanje pločica" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jedinica *</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" placeholder="m2, kom, h..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cena (RSD) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kategorija</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                <option value="rad">Rad</option>
                <option value="materijal">Materijal</option>
                <option value="ostalo">Ostalo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-lg text-sm border border-gray-300 text-gray-600">Otkaži</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Učitavanje...</div>
      ) : items.length === 0 ? (
        <EmptyState icon="💰" title="Nema stavki" message="Dodajte usluge i materijale" />
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_COLORS[item.category] || ''}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.unit}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900">{Number(item.price).toLocaleString('sr-RS')} RSD</div>
                  <div className="text-xs text-gray-400">/ {item.unit}</div>
                </div>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => openEdit(item)}
                  className="flex-1 text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-1">Izmeni</button>
                <div className="w-px bg-gray-200" />
                <button onClick={() => handleDelete(item.id)}
                  className="flex-1 text-center text-sm font-medium text-red-400 hover:text-red-600 py-1">Obriši</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
