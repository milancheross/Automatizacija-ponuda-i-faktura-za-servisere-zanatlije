const ROWS = [
  { feature: 'Kreiranje ponude', viber: 'Ručno, od nule svaki put', excel: 'Ručno kopiranje', sp: 'Iz cenovnika, 2 minuta' },
  { feature: 'Baza klijenata', viber: 'Razbacano po porukama', excel: 'Tabela, teško pretraži', sp: 'Kartice, brza pretraga' },
  { feature: 'Klijent prihvata ponudu', viber: 'Dogovor na reč', excel: 'Email, bez potpisa', sp: 'Link + digitalni potpis' },
  { feature: 'Praćenje statusa', viber: 'Ne postoji', excel: 'Ručno ažuriranje', sp: 'Automatski, u realnom vremenu' },
  { feature: 'Pravljenje fakture', viber: 'Novi dokument od nule', excel: 'Copy-paste', sp: 'Jednim klikom iz ponude' },
  { feature: 'Pregled neplaćenih', viber: 'Nema', excel: 'Ručno praćenje', sp: 'Dashboard prikaz' },
  { feature: 'PDF export', viber: 'Ne postoji', excel: 'Osnovno', sp: 'Profesionalni PDF' },
  { feature: 'Sa telefona', viber: 'Delimično', excel: 'Teško', sp: 'Potpuno — mobilni dizajn' },
]

export default function ComparisonSection() {
  return (
    <section className="py-16 md:py-24 bg-white px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Zašto ne Viber, papir i Excel?
          </h2>
          <p className="text-gray-600 text-lg">
            Svako "rešenje" ima svoja ograničenja — i košta te više nego što misliš.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Funkcionalnost</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-500">Viber / Papir</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-500">Excel</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-[#1e3a8a] bg-blue-50">Servis Ponuda</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">{row.viber}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">{row.excel}</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-[#1e3a8a] bg-blue-50/50">{row.sp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {ROWS.map(row => (
            <div key={row.feature} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-900 text-sm">{row.feature}</div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs text-gray-400 font-semibold shrink-0 w-24">Viber/Papir</span>
                  <span className="text-xs text-gray-500 text-right">{row.viber}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs text-gray-400 font-semibold shrink-0 w-24">Excel</span>
                  <span className="text-xs text-gray-500 text-right">{row.excel}</span>
                </div>
                <div className="flex justify-between items-start gap-2 bg-blue-50 rounded-lg px-2 py-2">
                  <span className="text-xs text-blue-600 font-bold shrink-0 w-24">Servis Ponuda</span>
                  <span className="text-xs text-[#1e3a8a] font-semibold text-right">{row.sp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
