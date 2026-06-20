const TRADES = [
  { icon: '⚡', label: 'Električari' },
  { icon: '🔧', label: 'Vodoinstalateri' },
  { icon: '❄️', label: 'Klima servisi' },
  { icon: '🏗️', label: 'Keramičari' },
  { icon: '🪟', label: 'ALU/PVC majstori' },
  { icon: '🎨', label: 'Moleri i farbari' },
  { icon: '🏠', label: 'Mali izvođači radova' },
  { icon: '🔌', label: 'Servisne firme' },
]

export default function AudienceSection() {
  return (
    <section className="py-16 md:py-24 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Napravljeno za majstore i servise
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ako danas šalješ ponude Viberom, pišeš ih u Excelu ili nosiš rokovnik —
            Servis Ponuda je napravljena za tebe. Bez obzira da li radiš sam ili imaš malu ekipu.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {TRADES.map(t => (
            <div key={t.label} className="flex flex-col items-center gap-3 p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group">
              <span className="text-4xl">{t.icon}</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1e3a8a] text-center">{t.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-[#1e3a8a] font-semibold">
            Sve što šalješ klijentu treba da izgleda profesionalno — čak i kad radiš sam i nemaš sekretaricu ni računovodstvo.
          </p>
        </div>
      </div>
    </section>
  )
}
