export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  trial: 'bg-blue-100 text-blue-700',
  starter: 'bg-green-100 text-green-700',
  pro: 'bg-purple-100 text-purple-700',
}

const STATUS_BADGE: Record<string, string> = {
  free: 'bg-gray-100 text-gray-500',
  trialing: 'bg-blue-100 text-blue-600',
  active: 'bg-green-100 text-green-700',
  past_due: 'bg-red-100 text-red-600',
  canceled: 'bg-gray-200 text-gray-500',
}

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || ''

  let query = supabase
    .from('users')
    .select('id, email, company_name, plan, subscription_status, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) query = query.ilike('email', `%${q}%`)

  const { data: users } = await query

  const ids = (users || []).map(u => u.id)
  const [{ data: qRows }, { data: iRows }] = await Promise.all([
    ids.length ? supabase.from('quotes').select('user_id').in('user_id', ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from('invoices').select('user_id').in('user_id', ids) : Promise.resolve({ data: [] }),
  ])

  const quoteCounts: Record<string, number> = {}
  const invoiceCounts: Record<string, number> = {}
  for (const r of qRows || []) quoteCounts[r.user_id] = (quoteCounts[r.user_id] || 0) + 1
  for (const r of iRows || []) invoiceCounts[r.user_id] = (invoiceCounts[r.user_id] || 0) + 1

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Korisnici ({users?.length ?? 0})</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Pretraga po emailu..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Traži</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Kompanija</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Ponude</th>
              <th className="px-4 py-3 text-right">Fakture</th>
              <th className="px-4 py-3 text-left">Registrovan</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!users?.length && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Nema korisnika</td></tr>
            )}
            {(users || []).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.company_name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_BADGE[u.plan] || PLAN_BADGE.free}`}>
                    {u.plan || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[u.subscription_status] || STATUS_BADGE.free}`}>
                    {u.subscription_status || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{quoteCounts[u.id] ?? 0}</td>
                <td className="px-4 py-3 text-right text-gray-600">{invoiceCounts[u.id] ?? 0}</td>
                <td className="px-4 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString('sr-RS') : '—'}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline text-xs">Detalji</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
