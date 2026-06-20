export default function QuotePreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kako izgleda ponuda koju klijent dobije
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Klijent otvori link — bez registracije, bez aplikacije. Vidi profesionalnu ponudu, prihvati je sa potpisom ili odbije. Sve u jednom koraku.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Quote preview card */}
          <div className="w-full max-w-md mx-auto lg:mx-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#1e3a8a] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Servis Klima d.o.o.</div>
                  <div className="text-white font-bold text-lg">Ponuda SP-2024-009</div>
                </div>
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Čeka odgovor</span>
              </div>
            </div>

            {/* Client info */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Za klijenta</div>
              <div className="font-semibold text-gray-900">Ana Jovanović</div>
              <div className="text-sm text-gray-500">Bulevar oslobođenja 42, Novi Sad</div>
            </div>

            {/* Items */}
            <div className="px-6 py-4">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Stavke ponude</div>
              <div className="space-y-3">
                {[
                  { name: 'Montaža klima uređaja 12000 BTU', qty: 1, unit: 'kom', price: '8.000' },
                  { name: 'Bakarne cevi i izolacija', qty: 3, unit: 'm', price: '1.500' },
                  { name: 'Električni priključak', qty: 1, unit: 'kom', price: '2.500' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.qty} {item.unit}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 shrink-0">{item.price} RSD</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Ukupno</span>
                  <span className="font-bold text-[#1e3a8a] text-2xl">12.000 RSD</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">Važi do: 15.07.2024.</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-3 text-center">Prihvataš ovu ponudu? Potpiši se ispod.</div>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-[#1e3a8a] text-white text-sm font-bold py-3 rounded-xl">
                  ✓ Prihvatam
                </button>
                <button className="border-2 border-gray-200 text-gray-600 text-sm font-semibold py-3 rounded-xl">
                  ✗ Odbijam
                </button>
              </div>
            </div>
          </div>

          {/* Callouts */}
          <div className="w-full max-w-md mx-auto lg:mx-0 space-y-4 lg:pt-8">
            {[
              {
                icon: '🔗',
                title: 'Klijent dobija link',
                desc: 'Šalješ mu link putem SMS-a, Vibera ili emaila. Otvara ga na telefonu, bez ikakve registracije.',
              },
              {
                icon: '✍️',
                title: 'Prihvata sa potpisom',
                desc: 'Klijent se potpiše prstom ili mišem direktno na telefonu. Prihvatanje je dokumentovano.',
              },
              {
                icon: '🔔',
                title: 'Ti odmah vidiš',
                desc: 'Čim klijent otvori link, vidiš to u aplikaciji. Čim prihvati — jednim klikom kreiras fakturu.',
              },
              {
                icon: '📄',
                title: 'Bez papira, bez štampanja',
                desc: 'Ceo proces je digitalan. PDF možeš preuzeti u svakom trenutku — za oba dokumenta.',
              },
            ].map(point => (
              <div key={point.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {point.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{point.title}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{point.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
