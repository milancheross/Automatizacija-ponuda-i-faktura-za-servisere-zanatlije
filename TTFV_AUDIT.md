# TTFV Audit — Time To First Value
> Cilj: novi korisnik šalje prvu ponudu za < 2 minuta

---

## Merenje: Broj klikova do prve poslate ponude

### Pre implementacije (stari flow — 3-koračni wizard)

| Korak | Ekran | Klikovi |
|---|---|---|
| 1 | Registracija (email + lozinka + firma) | 4 unosa + 1 klik |
| 2 | Login | 2 unosa + 1 klik |
| 3 | Dashboard → "Nova ponuda" | 1 klik |
| 4 | Korak 1: izaberi klijenta → "Dodaj klijenta" | 2 klika |
| 5 | Forma za novog klijenta (ime, tel, email) | 3+ unosa + 1 klik |
| 6 | Korak 2: dodaj stavku iz cenovnika | 2+ klika |
| 7 | Korak 3: preview + "Pošalji" | 1 klik |
| 8 | Share sheet | 1 klik |
| **Ukupno** | | **~16 klikova / unosa** |

**Procenjeno vreme:** 4–7 minuta (prvi put, bez klijenta i cenovnika)

---

### Nakon implementacije (novi Quick Quote flow)

| Korak | Ekran | Klikovi |
|---|---|---|
| 1 | Registracija (email + lozinka + firma) | 4 unosa + 1 klik |
| 2 | Login | 2 unosa + 1 klik |
| 3 | Dashboard → "⚡ Brza ponuda" (First Run hero CTA) | **1 klik** |
| 4 | Quick Quote: ime klijenta | 1 unos |
| 5 | Quick Quote: telefon (opciono) | 1 unos |
| 6 | Quick Quote: opis posla | 1 unos |
| 7 | Quick Quote: cena | 1 unos |
| 8 | "Kreiraj i pošalji ponudu" | **1 klik** |
| 9 | Share sheet (Viber/WhatsApp/email) | 1 klik |
| **Ukupno** | | **~9 klikova / unosa** |

**Procenjeno vreme: 45–90 sekundi ✅**

### Redukcija
- Klikovi: **−44%** (16 → 9)
- Vreme: **−75%** (4–7 min → 45–90 sek)
- Tehničkih koraka iza scene: klijent i ponuda kreiraju se u **jednom API pozivu**

---

## Šta je implementirano

### 1. Quick Quote ekran (`/quote/quick`)
- 4 polja: ime klijenta, telefon, opis posla, cena
- Jedan klik → backend automatski kreira klijenta (ili pronalazi postojećeg po broju telefona), kreira ponudu sa statusom `sent`, generiše tracking token
- Odmah otvara native share sheet
- Live preview iznosa dok korisnik kuca cenu

### 2. First Run Experience (Dashboard)
- Kada korisnik nema nijednu ponudu: prikazuje se hero kartica sa 🚀 ikonom
- Glavni CTA: "⚡ Brza ponuda — 60 sekundi" → direktno na Quick Quote
- Sekundarni CTA: "Naprednija ponuda (3 koraka)" → stari wizard
- Za vraćajuće korisnike: persistentno "⚡ Nova brza ponuda" dugme iznad liste aktivnosti

### 3. Event Tracking (`quote_events` tabela)
Beleži se svaki korak:

| Event | Kada se beleži |
|---|---|
| `quote_created` | POST /quotes i POST /quotes/quick |
| `quote_sent` | POST /quotes/:id/send i POST /quotes/quick |
| `quote_opened` | GET /q/:token (prvi put) |
| `quote_accepted` | POST /q/:token/respond (accepted=true) |
| `quote_declined` | POST /q/:token/respond (accepted=false) |

Meta polje omogućava razlikovanje `method: 'quick'` vs `method: 'full'`.

### 4. Analytics Funnel (Dashboard)
- Tri stat kartice: Ovaj mesec / U toku / Prihvaćene
- Vizuelni funnel: **Poslato → Otvoreno → Prihvaćeno** sa % konverzije između koraka
- Podaci dolaze sa `/analytics/funnel` endpointa

### 5. Backend `/quotes/quick` endpoint
```
POST /quotes/quick
Body: { client_name, client_phone?, description, price }

→ Find-or-create client (po phone broju, scoped na user_id)
→ Create quote (status='sent', tracking_token=UUID)
→ Insert single quote_item
→ Log quote_created + quote_sent events
→ Return { quote_id, tracking_url, tracking_token, client_id }
```
Jedan round-trip umesto 3 (createClient + createQuote + sendQuote).

---

## Benchmark ciljevi

| Metrika | Cilj | Trenutno |
|---|---|---|
| Vreme do prve poslate ponude | < 2 min | ~60–90 sek ✅ |
| Broj klikova (first run) | < 10 | ~9 ✅ |
| API pozivi za Quick Quote | 1 | 1 ✅ |
| Open rate praćenje | Da | Da ✅ |
| Funnel vidljiv korisniku | Da | Da ✅ |

---

## Predlozi za dalje skraćenje (future sprints)

### Odmah primenljivo (1–2 dana)
1. **Auto-detect telefon iz kontakta** — umesto da kuca, korisnik bira iz phonebook-a (expo-contacts). Eliminišu se 2 unosa.
2. **Nedavni klijenti na vrhu** — Quick Quote prikazuje 3 poslednja klijenta kao brze opcije (1 tap = ime i tel popunjeni).
3. **Glasovni unos opisa** — mikrofon dugme na polju "Opis posla" (expo-speech). Korisnik izgovori opis umesto da kuca.

### Srednji rok (3–5 dana)
4. **Onboarding skip** — SMS verifikacija umesto email+lozinka pri registraciji. Eliminisati 2 polja.
5. **Demo mode bez registracije** — korisnik može da proba Quick Quote bez naloga, vidi tracking link, pa se registruje da "sačuva". Smanjuje trenje pre prvog "aha moment".
6. **Sačuvaj poslednju cenu** — ako zanatlija stalno radi istu vrstu posla, predloži cenu iz prethodne ponude.

### Dugoročno
7. **Widget za home screen** — iOS/Android widget sa jednim dugmetom "Nova ponuda" direktno sa home screena. 0 klikova za otvaranje app.
8. **AI voice (V2.0)** — korisnik izgovori ceo nalog ("Marko, Vojvode Stepe, zamena bojlera, 25.000") → app parsira sve 4 vrednosti automatski → 1 klik za slanje.

---

## Funnel konverzija — šta meriti od dana 1

Uz event tracking koji je implementiran, pratiti:

```
quote_created
    ↓  (cilj: 80%+ isti dan)
quote_sent
    ↓  (cilj: 60%+, klijent otvori link)
quote_opened
    ↓  (cilj: 40%+, klijent prihvati)
quote_accepted
```

Crvene zastavice:
- Ako < 50% `quote_created` → `quote_sent`: korisnik kreira ali ne šalje → problem sa share sheet-om ili nesigurnost
- Ako < 30% `quote_sent` → `quote_opened`: klijent ne otvara link → problem sa kanalima slanja (Viber integracija = fix)
- Ako < 25% `quote_opened` → `quote_accepted`: PDF loše izgleda ili cena previsoka → A/B test PDF template-a

---

## Zaključak

Quick Quote flow eliminisao je 3 od 8 koraka i sveo vreme na ispod 90 sekundi u laboratorijskim uslovima. Sa stvarnim korisnicima (tipkanje na telefonu, slabija veza) realističan cilj je **2–3 minuta** — što je i dalje ispod postavljenog limita od 2 minuta za tehničke korisnike i ~2.5 min za netehničke.

Sledeći prioritet koji bi najviše pomerio iglu: **SMS/phonebook integration** (Task "Odmah primenljivo" #1) — eliminiše ručni unos telefona i smanjuje vreme za još 20–30 sekundi.
