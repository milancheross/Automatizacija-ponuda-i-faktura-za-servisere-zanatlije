import Link from 'next/link'

const STEPS = [
  {
    num: '1',
    icon: '👤',
    title: 'Dodaj klijenta',
    desc: 'Sačuvaj ime, telefon i adresu klijenta. Više nikad ne tražiš kontakt po porukama — sve je na jednom mestu sa istorijom svih ponuda.',
    detail: 'Brza pretraga, kartice klijenata',
  },
  {
    num: '2',
    icon: '📋',
    title: 'Napravi ponudu iz cenovnika',
    desc: 'Izaberi usluge i materijal iz svog sačuvanog cenovnika. Dodaj stavke, postavi popust — ponuda je gotova za manje od 2 minuta.',
    detail: 'Automatski broj, pregled po kategorijama',
  },
  {
    num: '3',
    icon: '📤',
    title: 'Pošalji i prati status',
    desc: 'Klijent dobija link — otvara ponudu bez registracije, prihvata je sa digitalnim potpisom ili odbija. Ti jednim klikom pretvaraš u fakturu.',
    detail: 'Prihvaćena ponuda → faktura jednim klikom',
  },
]

export default function HowItWorks() {
  return (
    <section id="kako-radi" className="py-16 md:py-24 bg-white px-4 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kako radi?</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Tri koraka od prvog kontakta sa klijentom do naplate.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%_-_16px)] w-[calc(100%_-_64px)] h-0.5 bg-gray-200 z-0" />
              )}

              <div className="relative z-10 flex flex-col items-start">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-[#1e3a8a] rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    {step.icon}
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                    {step.num}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-3">{step.desc}</p>
                <div className="text-xs text-[#1e3a8a] font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-900 transition-colors"
          >
            Napravi nalog i probaj odmah →
          </Link>
        </div>
      </div>
    </section>
  )
}
