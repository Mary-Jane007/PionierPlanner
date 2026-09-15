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

Publieke site: [https://pionierplanner.onrender.com](https://pionierplanner.onrender.com)

Op je telefoon open je dezelfde site (of installeer je hem als **offline webapp**). Een account dat je maakt, werkt op computer én telefoon: e-mail en wachtwoord worden in de cloud bewaard.

```bash
npm run build
npm run preview
```

`preview` / `npm start` serveert de statische export (inclusief service worker) en de cloud-API (`/api/cloud`) op [http://127.0.0.1:4321](http://127.0.0.1:4321). `next start` werkt niet: de app is een static export (`output: "export"`). `next dev` start de API ernaast (via `scripts/dev.mjs`).

## Render

De app is een statische export plus een kleine Node-API voor accounts.

- **Web Service:** Build `npm ci && npm run build`, Start `npm start` (serveert `out/` via `scripts/preview.mjs`, luistert op `PORT`).
- Zet **`DATABASE_URL`** (Neon) en **`AUTH_SECRET`** in de Render-omgeving. Zonder die variabelen blijft inloggen alleen lokaal.

`render.yaml` beschrijft dit.

```bash
npm run mobile:apk
```

Dat zet `public/downloads/pioniersplanner.apk` klaar. Installeer het bestand op Android en sta installatie van onbekende bronnen toe.

Gebruik **Open met een lege planner** om zonder voorbeeldactiviteiten te beginnen, of maak een eigen account.

## Gegevens en privacy

Nieuwe accounts worden in de cloud bewaard (Neon). Daarmee log je overal in met hetzelfde e-mailadres en wachtwoord. De planner-gegevens van dat account synchroniseren mee. “Open met een lege planner” blijft alleen lokaal.

- Ervaringen zijn standaard privé
- Exporteren en account verwijderen staan onder Profiel
- Wachtwoorden worden op de server gehashed; tokens blijven op het apparaat tot je uitlogt

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Zod, date-fns, Recharts.

## Git remotes

- GitHub: `https://github.com/Mary-Jane007/PionierPlanner.git`
- Cursor Origin (native, not a GitHub mirror): [marisolleefland/PionierPlanner](https://cursor.com/codebase/marisolleefland/PionierPlanner) — `https://origin.cursor.com/marisolleefland/PionierPlanner.git`

```bash
git remote add cursor https://origin.cursor.com/marisolleefland/PionierPlanner.git
```
