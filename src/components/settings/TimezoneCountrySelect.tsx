"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { useLang, useT } from "@/lib/i18n"
import {
  COUNTRY_TIMEZONES,
  countryOptionLabel,
  filterCountries,
  findCountryByTimezone,
  formatTimeInZone,
  resolveTimeZone,
  timezoneOffsetLabel,
} from "@/lib/timezones"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type TimezoneCountrySelectProps = {
  value: string
  onChange: (timezone: string) => void
  id?: string
}

export function TimezoneCountrySelect({ value, onChange, id = "timezone-country" }: TimezoneCountrySelectProps) {
  const t = useT()
  const lang = useLang()
  const [query, setQuery] = useState("")
  const [now, setNow] = useState(() => new Date())
  const timezone = resolveTimeZone(value)
  const selected = findCountryByTimezone(timezone)
  const options = useMemo(() => {
    const list = filterCountries(query, lang)
    if (selected && !list.some((country) => country.code === selected.code)) {
      return [selected, ...list]
    }
    return list
  }, [query, lang, selected])
  const selectedCode = selected?.code ?? ""

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  function selectCountry(code: string) {
    const country = COUNTRY_TIMEZONES.find((item) => item.code === code)
    if (!country) return
    onChange(resolveTimeZone(country.timezone))
  }

  return (
    <div className="grid gap-2">
      <Input
        id={`${id}-search`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("settings.timezoneSearch")}
        autoComplete="off"
        className="h-11 rounded-xl"
      />
      <select
        id={id}
        className={cn(fieldClass, "bg-card")}
        value={selectedCode}
        onChange={(event) => selectCountry(event.target.value)}
        size={query.trim() ? Math.min(10, Math.max(options.length, 2)) : undefined}
      >
        {!selectedCode ? (
          <option value="" disabled>
            {t("settings.timezone")}
          </option>
        ) : null}
        {options.map((country) => (
          <option key={country.code} value={country.code}>
            {countryOptionLabel(country, lang, now)}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        {t("settings.timezoneHint", {
          n: COUNTRY_TIMEZONES.length,
          time: formatTimeInZone(timezone, lang, now),
          offset: timezoneOffsetLabel(timezone, now),
        })}
      </p>
    </div>
  )
}
