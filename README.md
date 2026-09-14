# Pioniersplanner

Persoonlijke planner voor pioniers: kalender, slimme urenplanning, voortgang en ervaringen. Nederlands als hoofdtaal, met vertalingen voor Engels, Spaans en Papiamentu.

**Pioniersplanner is een onafhankelijke planningstool en is niet ontwikkeld, beheerd of goedgekeurd door Jehovah’s Getuigen of een organisatie die met Jehovah’s Getuigen verbonden is.** Officiële informatie over pioniersdienst staat op [JW.org](https://www.jw.org/nl/jehovahs-getuigen/vragen/wie-zijn-pioniers/).

## Wat kun je ermee

- **Vandaag** — overzicht van doel, voortgang, planning en een bemoedigende gedachte
- **Kalender** — maand-, week- en dagweergave, filters en slepen om te verplaatsen
- **Planner** — maandwizard, beschikbaarheid, herstelopties, week aanvullen en “Wat als?”
- **Statistieken** — uren, projectie, jaaroverzicht en persoonlijke inzichten
- **Ervaringen** — privé dagboek voor mooie momenten
- **Inspiratie** — originele tips plus korte samenvattingen met links naar JW.org
- **Offline** — installeerbare PWA; na de eerste keer laden werkt de planner zonder internet

Standaarddoelen zijn instelbaar (niet hard in de logica gebakken):

- Gewone pionier: 50 uur per maand
- Vaste hulppionier: 30 uur per maand
- Aangepast doel: zelf kiezen

## Lokaal starten

```bash
npm install
cp .env.example .env
npm run dev
```

De app draait op [http://127.0.0.1:4321](http://127.0.0.1:4321) (`PORT` in `.env`, default 4321). Dat adres werkt **niet** op je telefoon (`127.0.0.1` is alleen deze computer).

Publieke site (GitHub Pages): [https://mary-jane007.github.io/PionierPlanner/](https://mary-jane007.github.io/PionierPlanner/)

Op je telefoon kun je de site als **offline webapp (PWA)** installeren, of de Android-APK downloaden via **Download Android-app**. Na de eerste keer laden blijven de pagina’s, iconen en je lokale gegevens beschikbaar zonder internet.

```bash
npm run build
npm run preview
```

`preview` / `npm start` serveert de statische export (inclusief service worker) op [http://127.0.0.1:4321](http://127.0.0.1:4321). `next start` werkt niet: de app is een static export (`output: "export"`). `next dev` is voor ontwikkelen en registreert de service worker niet.

## Render

De app is een statische export. Gebruik geen Native Next.js-service met `next start`.

- **Static Site (aanbevolen):** Build `npm ci && npm run build`, publish directory `out`. `render.yaml` beschrijft dit.
- **Web Service:** Build `npm ci && npm run build`, Start `npm start` (serveert `out/` via `scripts/preview.mjs`, luistert op `PORT`).

```bash
npm run mobile:apk
```

Dat zet `public/downloads/pioniersplanner.apk` klaar. Installeer het bestand op Android en sta installatie van onbekende bronnen toe.

Gebruik **Open met een lege planner** om zonder voorbeeldactiviteiten te beginnen, of maak een eigen account.

## Gegevens en privacy

Deze versie bewaart alles lokaal in de browser (geen cloud-database). Je blijft ingelogd op hetzelfde apparaat; alleen **Uitloggen** of **Account verwijderen** wist de sessie. Het laatst gebruikte e-mailadres wordt onthouden. Geschikt om de planner te gebruiken en te beoordelen. Voor productie kun je later Supabase koppelen voor echte accounts en synchronisatie.

- Ervaringen zijn standaard privé
- Exporteren en account verwijderen staan onder Profiel
- Wachtwoorden worden lokaal gehashed; dit is geen vervanging van een echte authenticatieserver

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Zod, date-fns, Recharts.

## Git remotes

- GitHub: `https://github.com/Mary-Jane007/PionierPlanner.git`
- Cursor Origin (native, not a GitHub mirror): [marisolleefland/PionierPlanner](https://cursor.com/codebase/marisolleefland/PionierPlanner) — `https://origin.cursor.com/marisolleefland/PionierPlanner.git`

```bash
git remote add cursor https://origin.cursor.com/marisolleefland/PionierPlanner.git
```
