import type { LocaleCode } from "@/types"

/** ISO 3166-1 alpha-2 → IANA timezone of the capital / main zone. */
const COUNTRY_ZONES: [string, string][] = [
  ["AD", "Europe/Andorra"],
  ["AE", "Asia/Dubai"],
  ["AF", "Asia/Kabul"],
  ["AG", "America/Antigua"],
  ["AI", "America/Anguilla"],
  ["AL", "Europe/Tirane"],
  ["AM", "Asia/Yerevan"],
  ["AO", "Africa/Luanda"],
  ["AQ", "Antarctica/Palmer"],
  ["AR", "America/Argentina/Buenos_Aires"],
  ["AS", "Pacific/Pago_Pago"],
  ["AT", "Europe/Vienna"],
  ["AU", "Australia/Sydney"],
  ["AW", "America/Aruba"],
  ["AX", "Europe/Helsinki"],
  ["AZ", "Asia/Baku"],
  ["BA", "Europe/Sarajevo"],
  ["BB", "America/Barbados"],
  ["BD", "Asia/Dhaka"],
  ["BE", "Europe/Brussels"],
  ["BF", "Africa/Ouagadougou"],
  ["BG", "Europe/Sofia"],
  ["BH", "Asia/Bahrain"],
  ["BI", "Africa/Bujumbura"],
  ["BJ", "Africa/Porto-Novo"],
  ["BL", "America/St_Barthelemy"],
  ["BM", "Atlantic/Bermuda"],
  ["BN", "Asia/Brunei"],
  ["BO", "America/La_Paz"],
  ["BQ", "America/Kralendijk"],
  ["BR", "America/Sao_Paulo"],
  ["BS", "America/Nassau"],
  ["BT", "Asia/Thimphu"],
  ["BV", "Europe/Oslo"],
  ["BW", "Africa/Gaborone"],
  ["BY", "Europe/Minsk"],
  ["BZ", "America/Belize"],
  ["CA", "America/Toronto"],
  ["CC", "Indian/Cocos"],
  ["CD", "Africa/Kinshasa"],
  ["CF", "Africa/Bangui"],
  ["CG", "Africa/Brazzaville"],
  ["CH", "Europe/Zurich"],
  ["CI", "Africa/Abidjan"],
  ["CK", "Pacific/Rarotonga"],
  ["CL", "America/Santiago"],
  ["CM", "Africa/Douala"],
  ["CN", "Asia/Shanghai"],
  ["CO", "America/Bogota"],
  ["CR", "America/Costa_Rica"],
  ["CU", "America/Havana"],
  ["CV", "Atlantic/Cape_Verde"],
  ["CW", "America/Curacao"],
  ["CX", "Indian/Christmas"],
  ["CY", "Asia/Nicosia"],
  ["CZ", "Europe/Prague"],
  ["DE", "Europe/Berlin"],
  ["DJ", "Africa/Djibouti"],
  ["DK", "Europe/Copenhagen"],
  ["DM", "America/Dominica"],
  ["DO", "America/Santo_Domingo"],
  ["DZ", "Africa/Algiers"],
  ["EC", "America/Guayaquil"],
  ["EE", "Europe/Tallinn"],
  ["EG", "Africa/Cairo"],
  ["EH", "Africa/El_Aaiun"],
  ["ER", "Africa/Asmara"],
  ["ES", "Europe/Madrid"],
  ["ET", "Africa/Addis_Ababa"],
  ["FI", "Europe/Helsinki"],
  ["FJ", "Pacific/Fiji"],
  ["FK", "Atlantic/Stanley"],
  ["FM", "Pacific/Pohnpei"],
  ["FO", "Atlantic/Faroe"],
  ["FR", "Europe/Paris"],
  ["GA", "Africa/Libreville"],
  ["GB", "Europe/London"],
  ["GD", "America/Grenada"],
  ["GE", "Asia/Tbilisi"],
  ["GF", "America/Cayenne"],
  ["GG", "Europe/Guernsey"],
  ["GH", "Africa/Accra"],
  ["GI", "Europe/Gibraltar"],
  ["GL", "America/Nuuk"],
  ["GM", "Africa/Banjul"],
  ["GN", "Africa/Conakry"],
  ["GP", "America/Guadeloupe"],
  ["GQ", "Africa/Malabo"],
  ["GR", "Europe/Athens"],
  ["GS", "Atlantic/South_Georgia"],
  ["GT", "America/Guatemala"],
  ["GU", "Pacific/Guam"],
  ["GW", "Africa/Bissau"],
  ["GY", "America/Guyana"],
  ["HK", "Asia/Hong_Kong"],
  ["HM", "Indian/Kerguelen"],
  ["HN", "America/Tegucigalpa"],
  ["HR", "Europe/Zagreb"],
  ["HT", "America/Port-au-Prince"],
  ["HU", "Europe/Budapest"],
  ["ID", "Asia/Jakarta"],
  ["IE", "Europe/Dublin"],
  ["IL", "Asia/Jerusalem"],
  ["IM", "Europe/Isle_of_Man"],
  ["IN", "Asia/Kolkata"],
  ["IO", "Indian/Chagos"],
  ["IQ", "Asia/Baghdad"],
  ["IR", "Asia/Tehran"],
  ["IS", "Atlantic/Reykjavik"],
  ["IT", "Europe/Rome"],
  ["JE", "Europe/Jersey"],
  ["JM", "America/Jamaica"],
  ["JO", "Asia/Amman"],
  ["JP", "Asia/Tokyo"],
  ["KE", "Africa/Nairobi"],
  ["KG", "Asia/Bishkek"],
  ["KH", "Asia/Phnom_Penh"],
  ["KI", "Pacific/Tarawa"],
  ["KM", "Indian/Comoro"],
  ["KN", "America/St_Kitts"],
  ["KP", "Asia/Pyongyang"],
  ["KR", "Asia/Seoul"],
  ["KW", "Asia/Kuwait"],
  ["KY", "America/Cayman"],
  ["KZ", "Asia/Almaty"],
  ["LA", "Asia/Vientiane"],
  ["LB", "Asia/Beirut"],
  ["LC", "America/St_Lucia"],
  ["LI", "Europe/Vaduz"],
  ["LK", "Asia/Colombo"],
  ["LR", "Africa/Monrovia"],
  ["LS", "Africa/Maseru"],
  ["LT", "Europe/Vilnius"],
  ["LU", "Europe/Luxembourg"],
  ["LV", "Europe/Riga"],
  ["LY", "Africa/Tripoli"],
  ["MA", "Africa/Casablanca"],
  ["MC", "Europe/Monaco"],
  ["MD", "Europe/Chisinau"],
  ["ME", "Europe/Podgorica"],
  ["MF", "America/Marigot"],
  ["MG", "Indian/Antananarivo"],
  ["MH", "Pacific/Majuro"],
  ["MK", "Europe/Skopje"],
  ["ML", "Africa/Bamako"],
  ["MM", "Asia/Yangon"],
  ["MN", "Asia/Ulaanbaatar"],
  ["MO", "Asia/Macau"],
  ["MP", "Pacific/Saipan"],
  ["MQ", "America/Martinique"],
  ["MR", "Africa/Nouakchott"],
  ["MS", "America/Montserrat"],
  ["MT", "Europe/Malta"],
  ["MU", "Indian/Mauritius"],
  ["MV", "Indian/Maldives"],
  ["MW", "Africa/Blantyre"],
  ["MX", "America/Mexico_City"],
  ["MY", "Asia/Kuala_Lumpur"],
  ["MZ", "Africa/Maputo"],
  ["NA", "Africa/Windhoek"],
  ["NC", "Pacific/Noumea"],
  ["NE", "Africa/Niamey"],
  ["NF", "Pacific/Norfolk"],
  ["NG", "Africa/Lagos"],
  ["NI", "America/Managua"],
  ["NL", "Europe/Amsterdam"],
  ["NO", "Europe/Oslo"],
  ["NP", "Asia/Kathmandu"],
  ["NR", "Pacific/Nauru"],
  ["NU", "Pacific/Niue"],
  ["NZ", "Pacific/Auckland"],
  ["OM", "Asia/Muscat"],
  ["PA", "America/Panama"],
  ["PE", "America/Lima"],
  ["PF", "Pacific/Tahiti"],
  ["PG", "Pacific/Port_Moresby"],
  ["PH", "Asia/Manila"],
  ["PK", "Asia/Karachi"],
  ["PL", "Europe/Warsaw"],
  ["PM", "America/Miquelon"],
  ["PN", "Pacific/Pitcairn"],
  ["PR", "America/Puerto_Rico"],
  ["PS", "Asia/Gaza"],
  ["PT", "Europe/Lisbon"],
  ["PW", "Pacific/Palau"],
  ["PY", "America/Asuncion"],
  ["QA", "Asia/Qatar"],
  ["RE", "Indian/Reunion"],
  ["RO", "Europe/Bucharest"],
  ["RS", "Europe/Belgrade"],
  ["RU", "Europe/Moscow"],
  ["RW", "Africa/Kigali"],
  ["SA", "Asia/Riyadh"],
  ["SB", "Pacific/Guadalcanal"],
  ["SC", "Indian/Mahe"],
  ["SD", "Africa/Khartoum"],
  ["SE", "Europe/Stockholm"],
  ["SG", "Asia/Singapore"],
  ["SH", "Atlantic/St_Helena"],
  ["SI", "Europe/Ljubljana"],
  ["SJ", "Arctic/Longyearbyen"],
  ["SK", "Europe/Bratislava"],
  ["SL", "Africa/Freetown"],
  ["SM", "Europe/San_Marino"],
  ["SN", "Africa/Dakar"],
  ["SO", "Africa/Mogadishu"],
  ["SR", "America/Paramaribo"],
  ["SS", "Africa/Juba"],
  ["ST", "Africa/Sao_Tome"],
  ["SV", "America/El_Salvador"],
  ["SX", "America/Lower_Princes"],
  ["SY", "Asia/Damascus"],
  ["SZ", "Africa/Mbabane"],
  ["TC", "America/Grand_Turk"],
  ["TD", "Africa/Ndjamena"],
  ["TF", "Indian/Kerguelen"],
  ["TG", "Africa/Lome"],
  ["TH", "Asia/Bangkok"],
  ["TJ", "Asia/Dushanbe"],
  ["TK", "Pacific/Fakaofo"],
  ["TL", "Asia/Dili"],
  ["TM", "Asia/Ashgabat"],
  ["TN", "Africa/Tunis"],
  ["TO", "Pacific/Tongatapu"],
  ["TR", "Europe/Istanbul"],
  ["TT", "America/Port_of_Spain"],
  ["TV", "Pacific/Funafuti"],
  ["TW", "Asia/Taipei"],
  ["TZ", "Africa/Dar_es_Salaam"],
  ["UA", "Europe/Kyiv"],
  ["UG", "Africa/Kampala"],
  ["UM", "Pacific/Wake"],
  ["US", "America/New_York"],
  ["UY", "America/Montevideo"],
  ["UZ", "Asia/Tashkent"],
  ["VA", "Europe/Vatican"],
  ["VC", "America/St_Vincent"],
  ["VE", "America/Caracas"],
  ["VG", "America/Tortola"],
  ["VI", "America/St_Thomas"],
  ["VN", "Asia/Ho_Chi_Minh"],
  ["VU", "Pacific/Efate"],
  ["WF", "Pacific/Wallis"],
  ["WS", "Pacific/Apia"],
  ["XK", "Europe/Belgrade"],
  ["YE", "Asia/Aden"],
  ["YT", "Indian/Mayotte"],
  ["ZA", "Africa/Johannesburg"],
  ["ZM", "Africa/Lusaka"],
  ["ZW", "Africa/Harare"],
]

const ZONE_ALIASES: Record<string, string> = {
  "Europe/Kyiv": "Europe/Kiev",
  "America/Nuuk": "America/Godthab",
  "America/Kralendijk": "America/Curacao",
  "America/Lower_Princes": "America/Puerto_Rico",
  "America/Marigot": "America/Puerto_Rico",
  "America/St_Barthelemy": "America/Puerto_Rico",
  "Europe/Guernsey": "Europe/London",
  "Europe/Jersey": "Europe/London",
  "Europe/Isle_of_Man": "Europe/London",
  "Arctic/Longyearbyen": "Europe/Oslo",
  "Africa/Mbabane": "Africa/Johannesburg",
  "Africa/Maseru": "Africa/Johannesburg",
  "America/Tortola": "America/Puerto_Rico",
  "America/St_Thomas": "America/Puerto_Rico",
}

const SEARCH_ALIASES: Record<string, string[]> = {
  AW: ["aruba"],
  BQ: ["bonaire", "boneiru", "saba", "statia", "eustatius"],
  CW: ["curacao", "curaçao", "korsou", "kòrsou"],
  NL: ["nederland", "holland"],
  SR: ["suriname", "sranan"],
  SX: ["sint maarten", "st maarten"],
  US: ["usa", "america", "verenigde staten"],
}

export const DEFAULT_TIMEZONE = "Europe/Amsterdam"

export type CountryTimezone = {
  code: string
  timezone: string
}

export const COUNTRY_TIMEZONES: CountryTimezone[] = COUNTRY_ZONES.map(([code, timezone]) => ({
  code,
  timezone,
}))

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(new Date())
    return true
  } catch {
    return false
  }
}

export function resolveTimeZone(timeZone: string | null | undefined): string {
  const requested = String(timeZone || "").trim() || DEFAULT_TIMEZONE
  if (isValidTimeZone(requested)) return requested
  const alias = ZONE_ALIASES[requested]
  if (alias && isValidTimeZone(alias)) return alias
  return DEFAULT_TIMEZONE
}

export function countryName(code: string, lang: LocaleCode): string {
  const locales = lang === "pap" ? ["nl", "en"] : [lang, "nl", "en"]
  for (const locale of locales) {
    try {
      const name = new Intl.DisplayNames([locale], { type: "region" }).of(code)
      if (name) return name
    } catch {
      // Ignore missing locale/region support.
    }
  }
  return code
}

export function timezoneOffsetLabel(timeZone: string, date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: resolveTimeZone(timeZone),
      timeZoneName: "shortOffset",
    }).formatToParts(date)
    return parts.find((part) => part.type === "timeZoneName")?.value || ""
  } catch {
    return ""
  }
}

export function formatTimeInZone(timeZone: string, lang: LocaleCode, date = new Date()): string {
  const locale = lang === "pap" ? "nl" : lang
  return new Intl.DateTimeFormat(locale, {
    timeZone: resolveTimeZone(timeZone),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export function zonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: resolveTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value || "0")
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
  }
}

export function isoDateInZone(date: Date, timeZone: string): string {
  const { year, month, day } = zonedDateParts(date, timeZone)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function findCountryByTimezone(timeZone: string): CountryTimezone | undefined {
  const resolved = resolveTimeZone(timeZone)
  return (
    COUNTRY_TIMEZONES.find((country) => country.timezone === timeZone) ||
    COUNTRY_TIMEZONES.find((country) => resolveTimeZone(country.timezone) === resolved)
  )
}

export function countryOptionLabel(country: CountryTimezone, lang: LocaleCode, date = new Date()): string {
  const name = countryName(country.code, lang)
  const offset = timezoneOffsetLabel(country.timezone, date)
  return offset ? `${name} (${offset})` : name
}

export function filterCountries(query: string, lang: LocaleCode): CountryTimezone[] {
  const needle = query.trim().toLowerCase()
  const collator = new Intl.Collator(lang === "pap" ? "nl" : lang, { sensitivity: "base" })
  const sorted = [...COUNTRY_TIMEZONES].sort((a, b) =>
    collator.compare(countryName(a.code, lang), countryName(b.code, lang))
  )
  if (!needle) return sorted
  return sorted.filter((country) => {
    const name = countryName(country.code, lang).toLowerCase()
    const english = countryName(country.code, "en").toLowerCase()
    const aliases = SEARCH_ALIASES[country.code] ?? []
    return (
      name.includes(needle) ||
      english.includes(needle) ||
      country.code.toLowerCase().includes(needle) ||
      country.timezone.toLowerCase().includes(needle) ||
      aliases.some((alias) => alias.includes(needle))
    )
  })
}
