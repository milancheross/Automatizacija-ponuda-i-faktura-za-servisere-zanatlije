'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = ['free', 'trial', 'starter', 'pro']
const STATUSES = ['free', 'trialing', 'active', 'past_due', 'canceled']

export default function AdminUserActions({
  userId,
  currentPlan,
  currentStatus,
  currentTrialEnd,
}: {
  userId: string
  currentPlan: string
  currentStatus: string
  currentTrialEnd?: string | null
}) {
  const router = useRouter()
  const [plan, setPlan] = useState(currentPlan || 'free')
  const [status, setStatus] = useState(currentStatus || 'free')
  const [trialEnd, setTrialEnd] = useState(currentTrialEnd ? currentTrialEnd.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function save() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, subscription_status: status, trial_ends_at: trialEnd || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        setMsg({ type: 'err', text: d.error || 'Greška' })
      } else {
        setMsg({ type: 'ok', text: 'Sačuvano!' })
        router.refresh()
      }
    } catch {
      setMsg({ type: 'err', text: 'Mrežna greška' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="text-xs text-gray-400 uppercase font-bold mb-4">Admin akcije</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Plan</label>
          <select value={plan} onChange={e => setPlan(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status pretplate</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Trial do (datum)</label>
          <input type="date" value={trialEnd} onChange={e => setTrialEnd(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Čuvanje...' : 'Sačuvaj promene'}
        </button>
        {msg && (
          <span className={`text-sm ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</span>
        )}
      </div>
    </div>
  )
}
