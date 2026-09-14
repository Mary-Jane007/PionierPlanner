import type { DailyContent, LocaleCode } from "@/types"

const dailyNl: Omit<DailyContent, "language">[] = [
  {
    id: "d1",
    title: "Maak vandaag ruimte voor één goed gesprek.",
    text: "Je hoeft de hele dag niet vol te plannen. Eén oprecht gesprek kan al een mooie dag maken.",
    scriptureReference: "Kolossenzen 4:6",
    reflection:
      "Een kalm tempo helpt je om mensen écht op te merken — onderweg, bij de deur of in een korte pauze.",
    sourceType: "original",
    category: "encourage",
  },
  {
    id: "d2",
    title: "Plan ruimte voor onverwachte gesprekken.",
    text: "Laat in je ochtend of middag een klein stukje open. Zo blijft er lucht voor iemand die je niet had voorzien.",
    scriptureReference: "Spreuken 16:9",
    reflection:
      "Een goede planning is stevig én soepel. Die combinatie houdt dienst vreugdevol.",
    sourceType: "original",
    category: "time",
  },
  {
    id: "d3",
    title: "Begin klein, blijf vriendelijk.",
    text: "Als de dag vol voelt, kies dan één haalbaar blok. Consistentie groeit vaak uit rustige keuzes.",
    scriptureReference: "Galaten 6:9",
    reflection:
      "Je hoeft vandaag niet alles in te halen. Je kunt wel één volgende stap zetten.",
    sourceType: "original",
    category: "encourage",
  },
  {
    id: "d4",
    title: "Je aanwezigheid is al waardevol.",
    text: "Niet elk gesprek eindigt met een vervolg. Soms is een warme groet precies wat iemand nodig had.",
    scriptureReference: "1 Thessalonicenzen 2:8",
    reflection:
      "Schrijf later op wat je raakte. Dat helpt je herinneren waarom je dienst betekenis heeft.",
    sourceType: "original",
    category: "ministry",
  },
  {
    id: "d5",
    title: "Bescherm ook je rust.",
    text: "Een pioniermaand vraagt om wijsheid, niet om uitputting. Plan dienst én herstel.",
    scriptureReference: "Marcus 6:31",
    reflection:
      "Rust in je agenda is geen tekort. Het is wat je helpt om morgen weer met vreugde te dienen.",
    sourceType: "original",
    category: "time",
  },
  {
    id: "d6",
    title: "Een nabezoek mag eenvoudig blijven.",
    text: "Je hoeft geen perfecte les klaar te hebben. Belangstelling tonen is al een stevige volgende stap.",
    scriptureReference: "Filippenzen 2:4",
    reflection:
      "Zet een korte herinnering. Kleine, warme vervolgen bouwen vertrouwen.",
    sourceType: "original",
    category: "return",
  },
  {
    id: "d7",
    title: "Werk samen waar het kan.",
    text: "Een metgezel maakt een ochtend lichter — in gesprek, in timing en in bemoediging.",
    scriptureReference: "Prediker 4:9",
    reflection:
      "Als je alleen dient, mag dat ook. Kies dan een tempo dat bij jou past.",
    sourceType: "original",
    category: "ministry",
  },
]

export function getDailyContent(lang: LocaleCode, date = new Date()): DailyContent {
  const index = (date.getFullYear() + date.getMonth() + date.getDate()) % dailyNl.length
  const item = dailyNl[index]
  return { ...item, language: lang }
}

export function getDailyTip(lang: LocaleCode, date = new Date()): DailyContent {
  const tips = dailyNl.filter((item) => item.category === "time" || item.category === "encourage")
  const index = date.getDate() % tips.length
  return { ...tips[index], language: lang }
}
