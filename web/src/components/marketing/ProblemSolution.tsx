const BEFORE = [
  'Klijenti rasuti po Viberu, telefonu i papirima',
  'Svaku ponudu pišeš od nule, gubite vreme',
  'Ne znaš da li je klijent uopšte pogledao ponudu',
  'Fakture pišeš ručno, lako se izgube',
  'Nemaš pojma ko duguje a ko je platio',
  'Klijent prihvata na reč — bez dokumenta',
]

const AFTER = [
  'Svi klijenti na jednom mestu, brza pretraga',
  'Koristiš sačuvani cenovnik — ponuda za 2 minuta',
  'Vidiš kada je klijent otvorio link, u realnom vremenu',
  'Faktura iz ponude jednim klikom, bez ponovnog unošenja',
  'Dashboard ti pokazuje sve neplaćene fakture',
  'Klijent prihvata online sa digitalnim potpisom',
]

export default function ProblemSolution() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Prepoznaješ li ovaj haos?
          </h2>
          <p className="text-gray-600 text-lg">
            Previše vremena na administraciju, premalo na pravi posao.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">😮‍💨</div>
              <div>
                <div className="font-bold text-gray-900">Bez Servis Ponude</div>
                <div className="text-xs text-red-600 font-medium">Svaki dan isti haos</div>
              </div>
            </div>
            <ul className="space-y-3">
              {BEFORE.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
              <div>
                <div className="font-bold text-gray-900">Sa Servis Ponudom</div>
                <div className="text-xs text-green-600 font-medium">Sve pod kontrolom</div>
              </div>
            </div>
            <ul className="space-y-3">
              {AFTER.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
