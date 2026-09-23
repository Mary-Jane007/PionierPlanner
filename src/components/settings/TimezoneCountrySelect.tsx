"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { useLang, useT } from "@/lib/i18n"
import {
  COUNTRY_TIMEZONES,
  countryName,
  countryOptionLabel,
  filterCountries,
  findCountryByTimezone,
  formatTimeInZone,
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
  const [now, setNow] = useState<Date | null>(null)
  const selected = findCountryByTimezone(value)
  const timezone = selected?.timezone ?? value
  const options = useMemo(() => {
    const list = filterCountries(query, lang)
    if (selected && query.trim() && !list.some((country) => country.code === selected.code)) {
      return [...list, selected]
    }
    return list
  }, [query, lang, selected])
  const selectedCode = selected?.code ?? ""
  const searching = Boolean(query.trim())

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const needle = query.trim()
    if (!needle) return
    const matches = filterCountries(needle, lang)
    if (matches.length !== 1) return
    const country = matches[0]
    if (country.timezone === value) return
    onChange(country.timezone)
  }, [query, lang, value, onChange])

  function selectCountry(code: string) {
    const country = COUNTRY_TIMEZONES.find((item) => item.code === code)
    if (!country) return
    onChange(country.timezone)
    setQuery("")
  }

  const clock = now ?? new Date()
  const timeLabel = now ? formatTimeInZone(timezone, lang, clock) : "--:--"
  const offsetLabel = now ? timezoneOffsetLabel(timezone, clock) : ""
  const countryLabel = selected ? countryName(selected.code, lang) : timezone

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
        size={searching ? Math.min(10, Math.max(options.length, 2)) : undefined}
      >
        {!selectedCode ? (
          <option value="" disabled>
            {t("settings.timezone")}
          </option>
        ) : null}
        {options.map((country) => (
          <option key={country.code} value={country.code}>
            {countryOptionLabel(country, lang, clock)}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        {t("settings.timezoneHint", {
          n: COUNTRY_TIMEZONES.length,
          time: timeLabel,
          offset: offsetLabel,
          country: countryLabel,
        })}
      </p>
    </div>
  )
}
