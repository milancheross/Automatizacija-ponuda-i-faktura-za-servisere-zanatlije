'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

function DashboardMockup() {
  return (
    <div className="w-full max-w-sm">
      {/* Mini stat strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Klijenata', value: '24' },
          { label: 'Ponuda', value: '8' },
          { label: 'Na naplati', value: '3' },
        ].map(s => (
          <div key={s.label} className="bg-[#1e3a8a] rounded-xl p-3 text-center">
            <div className="text-white font-bold text-xl">{s.value}</div>
            <div className="text-blue-300 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quote card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Ponuda</div>
            <div className="font-bold text-gray-900 text-lg">SP-2024-007</div>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Prihvaćena</span>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-sm">P</div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Petar Nikolić</div>
            <div className="text-xs text-gray-500">Beograd</div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {[
            { name: 'Servis klime Daikin', qty: 1, price: '3.500' },
            { name: 'Filter za klima uređaj', qty: 2, price: '1.200' },
            { name: 'Dezinfekcija unutrašnje jedinice', qty: 1, price: '800' },
          ].map(item => (
            <div key={item.name} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
              <span className="font-medium text-gray-900">{item.price} RSD</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center mb-4">
          <span className="font-bold text-gray-900">Ukupno</span>
          <span className="font-bold text-[#1e3a8a] text-xl">6.700 RSD</span>
        </div>
        <button className="w-full bg-[#1e3a8a] text-white text-xs font-semibold py-2.5 rounded-lg">
          Pretvori u fakturu →
        </button>
      </div>
    </div>
  )
}

export default function Hero() {
  const { user, isLoading } = useAuth()

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white pt-14 pb-20 md:pt-20 md:pb-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:gap-12 lg:gap-20">
          <div className="md:flex-1 mb-12 md:mb-0">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1e3a8a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#1e3a8a] rounded-full"></span>
              Za majstore i servisne firme u Srbiji
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Napravi ponudu za{' '}
              <span className="text-[#1e3a8a]">2 minuta</span>{' '}
              — pošalji klijentu i pretvori u fakturu
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
              Dodaj klijenta, složi ponudu iz svog cenovnika i pošalji je linkom. Klijent prihvata online bez registracije, ti pretvaraš u fakturu jednim klikom. Sve sa telefona, sa terena.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {!isLoading && (
                user ? (
                  <Link href="/home"
                    className="inline-flex items-center justify-center gap-2 bg-[#1e3a8a] text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-blue-900 transition-colors">
                    Nastavi gde si stao →
                  </Link>
                ) : (
                  <>
                    <Link href="/register"
                      className="inline-flex items-center justify-center gap-2 bg-[#1e3a8a] text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-blue-900 transition-colors shadow-lg shadow-blue-200">
                      Isprobaj besplatno 30 dana →
                    </Link>
                    <a href="#kako-radi"
                      className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-7 py-4 rounded-xl font-semibold text-base hover:border-gray-400 transition-colors">
                      Pogledaj kako radi
                    </a>
                  </>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> 30 dana besplatno</span>
              <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Radi sa telefona</span>
              <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Bez ugovora</span>
            </div>
          </div>

          <div className="md:flex-1 flex justify-center md:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
