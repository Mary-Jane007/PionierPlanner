export interface ServiceYear {
  startYear: number
  endYear: number
  label: string
  start: Date
  end: Date
}

export function serviceYearFor(date = new Date()): ServiceYear {
  const year = date.getFullYear()
  const startYear = date.getMonth() >= 8 ? year : year - 1
  const endYear = startYear + 1
  return {
    startYear,
    endYear,
    label: `${startYear}–${endYear}`,
    start: new Date(startYear, 8, 1),
    end: new Date(endYear, 7, 31, 23, 59, 59),
  }
}

export function serviceYearMonths(startYear: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = (8 + index) % 12
    const year = month >= 8 ? startYear : startYear + 1
    return { year, month }
  })
}

export function inServiceYear(dateIso: string, year: ServiceYear) {
  return dateIso >= isoFromParts(year.startYear, 8, 1) && dateIso <= isoFromParts(year.endYear, 7, 31)
}

function isoFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
