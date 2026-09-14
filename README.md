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

De app draait op [http://127.0.0.1:4321](http://127.0.0.1:4321) (`PORT` in `.env`, default 4321).

Op je telefoon kun je de site als app installeren (PWA), of de Android-APK downloaden via **Download Android-app**.

```bash
npm run mobile:apk
```

Dat zet `public/downloads/pioniersplanner.apk` klaar. Installeer het bestand op Android en sta installatie van onbekende bronnen toe.

Gebruik **Open de demomaand** voor een gevulde september-achtige agenda, of maak een eigen account.

## Gegevens en privacy

Deze versie bewaart alles lokaal in de browser (geen cloud-database). Geschikt om de planner te gebruiken en te beoordelen. Voor productie kun je later Supabase koppelen voor echte accounts en synchronisatie.

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
