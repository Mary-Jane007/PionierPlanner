import { JW_ORG_HOME, JW_ORG_MINISTRY, JW_ORG_PIONEERS } from "@/lib/constants"
import type { OfficialResource } from "@/types"

export const officialResources: OfficialResource[] = [
  {
    id: "r1",
    title: "Wie zijn pioniers?",
    summary:
      "JW.org legt uit dat pioniers extra tijd aan de prediking geven. De precieze uurregeling kan veranderen; kijk op de officiële pagina voor de actuele informatie.",
    category: "pioneering",
    sourceUrl: JW_ORG_PIONEERS,
    language: "nl",
  },
  {
    id: "r2",
    title: "Activiteiten van Jehovah’s Getuigen",
    summary:
      "Een overzicht van hoe gemeenten prediken, vergaderingen houden en mensen uit de Bijbel helpen leren. Handig als je je eigen planning in een groter kader wilt zien.",
    category: "ministry",
    sourceUrl: JW_ORG_MINISTRY,
    language: "nl",
  },
  {
    id: "r3",
    title: "JW.org startpagina",
    summary:
      "De officiële website met Bijbelonderwijs, nieuws en hulpmiddelen voor prediking en persoonlijke studie. Gebruik deze bron voor actuele, officiële informatie.",
    category: "study",
    sourceUrl: JW_ORG_HOME,
    language: "nl",
  },
  {
    id: "r4",
    title: "Bijbel op JW.org",
    summary:
      "Lees Schriftplaatsen in context voordat je een gesprek of studie voorbereidt. Pioniersplanner geeft alleen verwijzingen; de volledige tekst staat op JW.org.",
    category: "study",
    sourceUrl: "https://www.jw.org/nl/bibliotheek/bijbel/",
    language: "nl",
  },
  {
    id: "r5",
    title: "Hulp bij de prediking",
    summary:
      "JW.org verzamelt artikelen en video’s over gesprekken beginnen, nabezoeken brengen en mensen helpen de Bijbel te onderzoeken. Kies wat bij jouw dag past.",
    category: "ministry",
    sourceUrl: "https://www.jw.org/nl/bibliotheek/",
    language: "nl",
  },
  {
    id: "r6",
    title: "Vergaderingen en gemeenteleven",
    summary:
      "Informatie over samenkomsten die je weekstructuur beïnvloeden. Plan dienst rondom deze vaste momenten, niet erdoorheen.",
    category: "time",
    sourceUrl: "https://www.jw.org/nl/jehovahs-getuigen/vergaderingen/",
    language: "nl",
  },
  {
    id: "r7",
    title: "Bemoediging vinden",
    summary:
      "JW.org bevat ervaringen en artikelen die bemoedigen bij tegenslag. Gebruik ze als steun, niet als maatstaf voor je uren.",
    category: "encourage",
    sourceUrl: "https://www.jw.org/nl/bibliotheek/ijdschriften/",
    language: "nl",
  },
  {
    id: "r8",
    title: "Persoonlijke studie",
    summary:
      "Regelmatige studie helpt je gesprekken natuurlijker voorbereiden. Zet studie in je agenda als een afspraak met jezelf.",
    category: "study",
    sourceUrl: "https://www.jw.org/nl/bibliotheek/boeken/",
    language: "nl",
  },
]
