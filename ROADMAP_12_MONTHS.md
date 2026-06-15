# Servis Ponuda — 12-mesečni Roadmap
> Perspektiva startup CTO-a | Cilj: 100 pretplatnika u Srbiji → 500 na Balkanu

---

## Strateška analiza

### Tržišni kontekst
- U Srbiji je ~180.000 aktivnih zanatlija i servisera
- Manje od 5% koristi ikakav softver za ponude
- Prosečna uplata za pretplatu: 1.500–3.000 RSD/mesec
- TAM (Srbija): ~5.4M EUR godišnje
- Balkanski TAM (HR, BA, SI, MK, ME): ~18M EUR godišnje

### Ključni uvid
Zanatlija ne kupuje "softver za ponude". Kupuje **više posla i brže plaćanje**.
Svaka funkcija mora biti opravdana jednom od dve stvari:
1. **Pomaže mu da dobije posao** (brža/profesionalnija ponuda)
2. **Pomaže mu da naplati brže** (faktura, plaćanje, podsetnik)

---

## MVP (Mesec 1–2) — Lansiranje
> Status: **Implementirano** ✅

### Šta je urađeno
- Auth + podešavanje firme (logo, PIB, adresa)
- Baza klijenata (CRUD)
- Cenovnik sa kategorijama (Rad/Materijal/Ostalo)
- 3-koračno kreiranje ponude (klijent → stavke → preview)
- PDF generisanje + share sheet (Viber/WhatsApp/email)
- Tracking sistem (UUID link → opened_at → push notifikacija)
- Konverzija ponude u fakturu
- Klijentski portal (web stranica za klijenta sa Prihvati/Odbij)
- Interactive prototype za investitore/demonstracije

### Poslovni cilj MVP-a
- 20–30 beta korisnika (zanatlije iz okruženja)
- Prikupi kvalitativni feedback pre naplate
- Validiraj core loop: kreiraj → pošalji → klijent prihvati

### Kritični rizici
| Rizik | Mitigacija |
|---|---|
| PDF loše izgleda na iOS/Android | Testiraj na oba uređaja pre lansiranja |
| Onboarding duže od 3 minute | A/B test: redukuj na 4 polja max |
| Zanatlija ne vidi vrednost odmah | Prva ponuda za 60 sekundi — to je demo pitch |

---

## V1.1 (Mesec 3–4) — Monetizacija + Prve 100 pretplate
> Fokus: Naplata + Retencija korisnika u Srbiji

### Funkcionalnosti

#### 1. Stripe pretplata — OBAVEZNO
**Poslovni uticaj:** Bez ovoga nema prihoda. Sve ostalo je sekundarno.
**Tehnička složenost:** Srednja (2–3 dana)
**Prioritet:** P0 — Blokira sve ostalo

Planovi:
- **Starter** 990 RSD/mes — do 10 ponuda/mes
- **Pro** 1.990 RSD/mes — neograničeno + statistike
- **Godišnji** 20% popust

**ROI:** Direktan, odmah.

---

#### 2. Viber Business API integracija
**Poslovni uticaj:** 🔥 KRITIČNO za Srbiju
- Viber ima 80%+ penetraciju kod odraslih u Srbiji
- Klijent dobija Viber poruku sa linkom — ne mora da otvara email
- Zanatlija vidi "✓✓" (dostavljena) i "👁" (pročitana) — poznat UX
- Prosečna stopa otvaranja Viber poruka: 85%+ vs email 22%

**Tehnička složenost:** Srednja (Viber Business API, 4–5 dana)
**Prioritet:** P1 — Najveći ROI za srpsko tržište

Implementacija:
```
POST /quotes/:id/send-viber
→ Viber Business API
→ Template poruka: "Marko je poslao ponudu od 15.000 RSD. Pogledaj ovde: [link]"
```

---

#### 3. Podsetnik 48h
**Poslovni uticaj:** Srednji — smanjuje gubitak posla zbog zaboravljenih ponuda
**Tehnička složenost:** Niska (cron job, 1 dan)
**Prioritet:** P2

Logika: Ako ponuda `status='sent'` i `opened_at IS NULL` posle 48h → push notifikacija zanatliji: "Klijent Petar Petrović još nije otvorio ponudu. Pošalji podsetnik?"

---

#### 4. Šabloni ponuda po zanatu
**Poslovni uticaj:** Srednji — skraćuje onboarding za 70%
**Tehnička složenost:** Niska (1–2 dana)
**Prioritet:** P2

Kada zanatlija registruje zanat (vodoinstalater, električ ar, klima, keramic...), automatski mu se puni cenovnik sa tipičnim uslugama i cenama za region. Ne mora ništa da unosi ručno od prvog dana.

---

#### 5. Osnovna statistika — Dashboard
**Poslovni uticaj:** Srednji — povećava perceived value, smanjuje churn
**Tehnička složenost:** Niska (1–2 dana)
**Prioritet:** P3

- Ponude ovog meseca vs prošlog
- Stopa prihvaćenosti (%)
- Prosečna vrednost ponude
- Prihod u toku (suma aktivnih ponuda)

---

### KPI za V1.1
| Metrika | Cilj |
|---|---|
| Plaćeni pretplatnici | 100 |
| MRR | ~150.000 RSD |
| Churn rate | < 8%/mes |
| Prosečno vreme kreiranje ponude | < 3 min |

---

## V1.2 (Mesec 5–7) — Regionalna ekspanzija + ROI funkcije
> Fokus: Balkanski trg + Funkcije koje direktno povećavaju prihode korisnika

### Funkcionalnosti

#### 1. SEF integracija (eFaktura)
**Poslovni uticaj:** 🔥 KRITIČNO za B2B segment u Srbiji
- Od 2024. obavezno za sve B2B transakcije u Srbiji
- Zanatlija koji radi sa firmama (ne fizičkim licima) **mora** imati ovo
- Direktan razlog promene alata — compliance = akvizicija korisnika

**Tehnička složenost:** Visoka (SEF API, XML format, digitalni sertifikat, 2–3 nedelje)
**Prioritet:** P1 za B2B korisnici

Implementacija:
- Integracija sa Poreska uprava SEF API
- Automatsko slanje eFakture kada se kreira
- Status tracking (primljena, odbijena, plaćena)

**ROI:** Otvara segment koji plaća 3x više (firme vs fizička lica)

---

#### 2. Online plaćanje ponude
**Poslovni uticaj:** 🔥 VISOK — smanjuje dane čekanja sa 14 na 2–3 dana
**Tehnička složenost:** Visoka (payment gateway integracija, 1–2 nedelje)
**Prioritet:** P1

Opcije za Balkanski trg:
- **Stripe** — kreditne kartice (Srbija, HR, SI)
- **Monri** — lokalni gateway za SR/BA/HR (prihvata lokalne kartice)
- **NBS QR kod** — instant plaćanje za srpske banke (besplatno, visoka adopcija)

Flow:
```
Klijent otvori portal → vidi ponudu → klikne "Plati odmah" 
→ NBS QR / kartica → zanatlija dobija potvrdu plaćanja
→ Automatski kreira fakturu + označi kao plaćeno
```

**ROI:** Direktan — korisnik koji koristi ovo ostaje 3x duže (switching cost)

---

#### 3. Elektronski potpis (basic)
**Poslovni uticaj:** Srednji — pravna zaštita zanatlije
**Tehnička složenost:** Srednja (1 nedelja)
**Prioritet:** P2

MVP implementacija (nije kvalifikovani eP, ali je dokaz saglasnosti):
- Klijent unosi ime i prezime na portalu + klikne "Prihvati"
- Beležimo: IP adresu, timestamp, user agent, GPS (opciono)
- PDF sa "Elektronski potpisano od strane [ime] dana [datum]"
- Dovoljno za sporove do 500.000 RSD

Napomena: Kvalifikovani elektronski potpis (QES) — za V2.0

---

#### 4. Višejezična podrška za Balkan
**Poslovni uticaj:** VISOK za regionalni rast
**Tehnička složenost:** Niska–Srednja (2–3 dana za prevod, 1 nedelja za i18n setup)
**Prioritet:** P2

Jezici:
| Jezik | Tržište | Pretplatnici potencijal |
|---|---|---|
| Srpski (latinica + ćirilica) | RS | 100 |
| Hrvatski | HR | 80 |
| Bosanski | BA | 50 |
| Makedonski | MK | 30 |
| Slovenački | SI | 40 |

**ROI:** Bez ovoga ne možeš na Balkan.

---

#### 5. WhatsApp Business API
**Poslovni uticaj:** Srednji za Srbiju, VISOK za HR/SI/BA
- WhatsApp dominira u Hrvatskoj, Bosni i Sloveniji
- Za Srbiju je manje bitan od Vibera, ali za Balkan je kritičan

**Tehnička složenost:** Srednja (WhatsApp Cloud API, 3–4 dana)
**Prioritet:** P2 — paketizuj sa Viber kao "Messenger Pack"

---

### KPI za V1.2
| Metrika | Cilj |
|---|---|
| Ukupni pretplatnici | 250 |
| Pretplatnici van Srbije | 50 |
| MRR | ~400.000 RSD |
| B2B pretplatnici | 30 |

---

## V2.0 (Mesec 9–12) — Platforma i Skaliranje na 500+
> Fokus: Timovi, CRM, AI, tržišna dominacija

### Funkcionalnosti

#### 1. AI kreiranje ponude glasom
**Poslovni uticaj:** 🔥 GAME CHANGER — najveći diferensijator na tržištu
**Tehnička složenost:** Visoka (Claude/Whisper API integracija, 3–4 nedelje)
**Prioritet:** P1 — glavni marketing argument za V2.0

Scenario upotrebe:
```
Zanatlija izađe iz stana, pritisne dugme u appu i kaže:
"Marko, Vojvode Stepe 45, zamena bojlera 80 litara Ariston, 
montaža, odvoz starog, materials uključeni, 35.000 dinara"

→ AI parsira govor
→ Prepoznaje klijenta iz baze (ili kreira novog)
→ Popunjava stavke iz cenovnika (matching po imenu)
→ Kreira ponudu za 8 sekundi
→ Pita: "Šalje se Marku?" → Zanatlija kaže DA → Ponuda otišla
```

Backend:
- Whisper API (OpenAI) za speech-to-text
- Claude API za parsing teksta u strukturu ponude
- Confidence score — ako AI nije siguran, pita korisnika

**ROI:**
- Smanjuje vreme kreiranja ponude sa 3 min na 15 sekundi
- Ovo je jedini feature koji možeš da staviš u video reklamu
- Povećava conversion rate za upis za 40%+ (na osnovu sličnih proizvoda)
- Opravdava veću cenu pretplate (Pro+/AI plan)

---

#### 2. Više zaposlenih po firmi
**Poslovni uticaj:** VISOK — otvara B2B/SME segment
**Tehnička složenost:** Visoka (role sistem, data isolation, 3–4 nedelje)
**Prioritet:** P1

Uloge:
| Uloga | Može da radi |
|---|---|
| **Vlasnik** | Sve |
| **Majstor** | Kreira ponude, vidi svoje klijente |
| **Administrativac** | Fakture, plaćanja, statistike |

Poslovni model:
- Base plan: 1 korisnik
- Team plan: do 5 korisnika (+500 RSD/mes po korisniku)
- Enterprise: >5 korisnika (custom pricing)

**ROI:** Povećava prosečni MRR po firmi sa 1.990 na 4.000–8.000 RSD

---

#### 3. CRM funkcionalnosti
**Poslovni uticaj:** Srednji-Visok — retencija i upsell
**Tehnička složenost:** Visoka (2–3 nedelje)
**Prioritet:** P2

Šta dodati:
- **Tagovi za klijente** (VIP, problematičan, firma/fizičko lice)
- **Istorija svih radova** po klijentu sa ukupnim prihodom
- **Sledeći kontakt** — podsetnik "Pozovi Marka za godišnji servis"
- **Napomene po klijentu** (slobodan tekst, interno)
- **Godišnji servis podsetnici** — automatski za klima servise (obavezni godišnji pregled)

**Killer feature za klima servise:** 
Svaki uređaj koji su servisirali pamti se sa datumom. 12 meseci posle, app automatski šalje poruku klijentu: "Vreme je za godišnji servis klima uređaja. Pošalji ponudu?"

**ROI:** Godišnji servis klijenti = 100% retencija, predvidivi prihodi

---

#### 4. Napredna analitika i izveštaji
**Poslovni uticaj:** Srednji
**Tehnička složenost:** Srednja (2 nedelje)
**Prioritet:** P3

- Prihod po mesecu (grafikon)
- Top klijenti po vrednosti
- Konverzija ponuda (% prihvaćenih)
- Prosečno vreme od slanja do odluke
- Export u Excel (računovođa ga traži)

---

### KPI za V2.0
| Metrika | Cilj |
|---|---|
| Ukupni pretplatnici | 500 |
| MRR | ~1.000.000 RSD |
| Prosečni ARPU | 2.000 RSD/mes |
| NPS score | >50 |
| Churn | < 4%/mes |

---

## Prioritizovana lista funkcija (ROI ranking)

> Od najveće do najmanje poslovne vrednosti

| # | Funkcija | Zašto visok ROI | Složenost | Verzija |
|---|---|---|---|---|
| 1 | **Stripe pretplata** | Bez prihoda nema ničega | Srednja | V1.1 |
| 2 | **Viber Business API** | 80% penetracija u SR, 85% open rate | Srednja | V1.1 |
| 3 | **AI kreiranje ponude glasom** | Jedinstven diferensijator, marketing virus | Visoka | V2.0 |
| 4 | **SEF eFaktura integracija** | Legal compliance = prisilna akvizicija | Visoka | V1.2 |
| 5 | **Online plaćanje (NBS QR + kartice)** | Smanjuje čekanje naplate 7x | Visoka | V1.2 |
| 6 | **Šabloni po zanatu** | Smanjuje onboarding za 70% | Niska | V1.1 |
| 7 | **WhatsApp Business API** | Kritičan za HR/BA/SI tržište | Srednja | V1.2 |
| 8 | **Više zaposlenih po firmi** | +100% ARPU po firmi | Visoka | V2.0 |
| 9 | **Elektronski potpis** | Pravna zaštita, smanjuje sporove | Srednja | V1.2 |
| 10 | **Podsetnik 48h** | Smanjuje gubitak posla | Niska | V1.1 |
| 11 | **CRM (tagovi, istorija, godišnji servis)** | Retencija i upsell | Visoka | V2.0 |
| 12 | **Višejezična podrška** | Obavezno za Balkan | Srednja | V1.2 |
| 13 | **Napredna analitika** | Perceived value, anti-churn | Srednja | V2.0 |

---

## Strategija akvizicije korisnika

### Srbija → 100 pretplatnika

**Kanal 1: Facebook/Instagram grupe zanatlija**
- Postoji 50+ FB grupa sa >100.000 zanatlija ukupno
- Organski post sa video demonstracijom (30 sek): "Napravio sam ponudu za 45 sekundi"
- Trošak: 0 RSD

**Kanal 2: YouTube/TikTok kratki video**
- "Gledaj kako električ ar kreira i šalje ponudu za 60 sekundi"
- Prikazuje AI glas feature (V2.0) kao marketing hook
- Trošak: 0 RSD + vreme

**Kanal 3: Direktna prodaja**
- Poseti 5 zanatlija lično, instaliraj im app, koristi 2 nedelje besplatno
- Ako ostanu, plaćaju. Ako ne, pitaj zašto.
- Trošak: gorivo

**Kanal 4: Referral program**
- "Pozovi prijatelja zanatliju → oba dobijate 1 mesec besplatno"
- Viber forward poruke su viralne u ovoj populaciji

### Balkan → 500 pretplatnika

**Kanal 1: Partnerstvo sa cehovskim udruženjima**
- Udruženje vodoinstalatera Srbije, Udruženje električara Balkana
- B2B2C: oni promovišu, ti daješ proviziju ili grupni popust

**Kanal 2: Lokalni resellers**
- U svakoj od 5 zemalja pronađi 1 osobu koja poznaje zanatlije
- Provizija 20% od pretplate za dovedene korisnike

**Kanal 3: Google Ads (lokalne pretrage)**
- "program za ponude vodoinstalater" — niska konkurencija, visok intent
- Budget: 200 EUR/mes po zemlji

---

## Tehnički dug i refaktorisanje

### Odmah (pre V1.1)
- [ ] Rate limiting na auth rutama (brute force zaštita)
- [ ] Input validation middleware (Joi/Zod)
- [ ] Email verifikacija pri registraciji

### Pre V1.2
- [ ] Background job queue (Bull/BullMQ) za slanje poruka i podsetnike
- [ ] Redis cache za cenovnike i profile (smanjuje Supabase calls)
- [ ] Webhook system za Viber/WhatsApp callbacks

### Pre V2.0
- [ ] Multi-tenancy refaktor (izolacija podataka po firmi)
- [ ] Admin panel (pregled svih korisnika, billing, support)
- [ ] Feature flag sistem (Unleash ili ručni) za postepeno uvođenje AI

---

## Finansijska projekcija

| Mesec | Pretplatnici | Avg. plan | MRR (RSD) | Kumulativ |
|---|---|---|---|---|
| 3 | 50 | 1.500 | 75.000 | 75.000 |
| 4 | 100 | 1.700 | 170.000 | 330.000 |
| 6 | 200 | 1.900 | 380.000 | 1.3M |
| 9 | 350 | 2.100 | 735.000 | 4.1M |
| 12 | 500 | 2.200 | 1.100.000 | 8.5M |

> Pretpostavka: 5% churn/mes, 15% mesečni rast akvizicije

**Breakeven:** ~Mesec 5 (uz 2 osnivača bez plate do tada)
**Seed round opravdanost:** Mesec 6–7 sa 200+ pretplatnika i 380K RSD MRR

---

## Zaključak CTO-a

### Tri stvari koje određuju uspeh

1. **Viber integracija u V1.1** — Bez toga si samo još jedan PDF generator. Sa tim si jedina app koja funkcioniše u ekosistemu koji zanatlije već koriste.

2. **AI glas u V2.0** — Ovo je tvoj "iPhone moment". Kada zanatlija prvi put izgovori nalog i vidi da app razume — on nikada ne odlazi. To je i viralni marketing koji se sam distribuira po YouTube-u.

3. **SEF pre konkurencije** — Firma koja prva uradi SEF + ponude za zanatlije osvaja B2B segment koji plaća 3x više i ne menja alate. Ovo je defensivni moat.

### Šta NE raditi

- ❌ Ne trosi vreme na mobilni POS terminal ili računovodstvo — to su zasebni proizvodi
- ❌ Ne ulazi u web app za zanatlije — fokus je mobile-first
- ❌ Ne pravi sve funkcije odjednom — svaka iteracija mora biti u korisničkim rukama za 4 nedelje

### Mantra tima

> "Zanatlija kreira ponudu za 60 sekundi, klijent je vidi za 30, prihvati za 10."
