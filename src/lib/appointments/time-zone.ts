import { APPOINTMENT_SLOT_MINUTES, APPOINTMENT_TIME_ZONE } from "./constants";

interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

interface LocalDateTimeParts extends LocalDateParts {
  hour: number;
  minute: number;
  second: number;
}

export interface ResolvedLocalInterval {
  startAt: Date;
  endAt: Date;
  slotStarts: Date[];
}

export class AppointmentTimeError extends Error {
  constructor(message = "Die lokale Terminzeit ist nicht eindeutig oder existiert nicht.") {
    super(message);
    this.name = "AppointmentTimeError";
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APPOINTMENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const timeLabelFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: APPOINTMENT_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateLabelFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: "UTC",
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const localInstantCache = new Map<string, number[]>();
const LOCAL_INSTANT_CACHE_LIMIT = 4096;

function formatterParts(date: Date): LocalDateTimeParts {
  const values = new Map(
    dateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)] as const),
  );

  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");
  const hour = values.get("hour");
  const minute = values.get("minute");
  const second = values.get("second");

  if ([year, month, day, hour, minute, second].some((value) => value === undefined)) {
    throw new AppointmentTimeError("Die konfigurierte Praxis-Zeitzone ist nicht verfügbar.");
  }

  return {
    year: year!,
    month: month!,
    day: day!,
    hour: hour!,
    minute: minute!,
    second: second!,
  };
}

function parseLocalDate(localDate: string): LocalDateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
  if (!match) throw new AppointmentTimeError("Ungültiges lokales Datum.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day) {
    throw new AppointmentTimeError("Ungültiges lokales Datum.");
  }

  return { year, month, day };
}

function formatLocalDateParts(parts: LocalDateParts): string {
  return `${parts.year.toString().padStart(4, "0")}-${parts.month.toString().padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
}

function sameLocalDateTime(left: LocalDateTimeParts, right: LocalDateTimeParts): boolean {
  return left.year === right.year
    && left.month === right.month
    && left.day === right.day
    && left.hour === right.hour
    && left.minute === right.minute
    && left.second === right.second;
}

function offsetAt(instant: Date): number {
  const parts = formatterParts(instant);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const instantAtWholeSecond = Math.floor(instant.getTime() / 1000) * 1000;
  return representedAsUtc - instantAtWholeSecond;
}

export function addLocalDays(localDate: string, days: number): string {
  const parsed = parseLocalDate(localDate);
  const result = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days));
  return formatLocalDateParts({
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  });
}

export function compareLocalDates(left: string, right: string): number {
  parseLocalDate(left);
  parseLocalDate(right);
  return left.localeCompare(right);
}

export function getIsoWeekday(localDate: string): number {
  const parsed = parseLocalDate(localDate);
  const weekday = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

export function getWeekStart(localDate: string): string {
  return addLocalDays(localDate, -(getIsoWeekday(localDate) - 1));
}

export function getWeekEnd(localDate: string): string {
  return addLocalDays(getWeekStart(localDate), 6);
}

export function instantToLocalDate(instant: Date): string {
  const parts = formatterParts(instant);
  return formatLocalDateParts(parts);
}

export function instantToLocalMinute(instant: Date): number {
  const parts = formatterParts(instant);
  return parts.hour * 60 + parts.minute;
}

export function localDateToDatabaseDate(localDate: string): Date {
  const parsed = parseLocalDate(localDate);
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
}

export function databaseDateToLocalDate(date: Date): string {
  return formatLocalDateParts({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

export function resolveLocalDateTime(localDate: string, minuteOfDay: number): Date[] {
  if (!Number.isInteger(minuteOfDay) || minuteOfDay < 0 || minuteOfDay > 24 * 60) {
    throw new AppointmentTimeError("Ungültige lokale Uhrzeit.");
  }

  const normalizedDate = minuteOfDay === 24 * 60 ? addLocalDays(localDate, 1) : localDate;
  const normalizedMinute = minuteOfDay === 24 * 60 ? 0 : minuteOfDay;
  const cacheKey = `${normalizedDate}:${normalizedMinute}`;
  const cached = localInstantCache.get(cacheKey);
  if (cached) return cached.map((timestamp) => new Date(timestamp));
  const parsed = parseLocalDate(normalizedDate);
  const requested: LocalDateTimeParts = {
    ...parsed,
    hour: Math.floor(normalizedMinute / 60),
    minute: normalizedMinute % 60,
    second: 0,
  };
  const naiveUtc = Date.UTC(
    requested.year,
    requested.month - 1,
    requested.day,
    requested.hour,
    requested.minute,
    0,
  );

  const offsets = new Set<number>();
  for (let hours = -48; hours <= 48; hours += 6) {
    offsets.add(offsetAt(new Date(naiveUtc + hours * 60 * 60 * 1000)));
  }

  const candidates = [...offsets]
    .map((offset) => new Date(naiveUtc - offset))
    .filter((candidate) => sameLocalDateTime(formatterParts(candidate), requested));

  const resolved = [...new Map(candidates.map((candidate) => [candidate.getTime(), candidate])).values()]
    .sort((left, right) => left.getTime() - right.getTime());

  if (localInstantCache.size >= LOCAL_INSTANT_CACHE_LIMIT) {
    const oldestKey = localInstantCache.keys().next().value;
    if (oldestKey) localInstantCache.delete(oldestKey);
  }
  localInstantCache.set(cacheKey, resolved.map((candidate) => candidate.getTime()));
  return resolved;
}

export function resolveLocalInterval(
  localDate: string,
  startMinute: number,
  durationMinutes: number,
): ResolvedLocalInterval {
  if (!Number.isInteger(startMinute)
    || !Number.isInteger(durationMinutes)
    || startMinute < 0
    || startMinute % APPOINTMENT_SLOT_MINUTES !== 0
    || durationMinutes <= 0
    || durationMinutes % APPOINTMENT_SLOT_MINUTES !== 0
    || startMinute + durationMinutes > 24 * 60) {
    throw new AppointmentTimeError("Der Termin liegt nicht auf dem gültigen Zeitraster.");
  }

  const boundaries: Date[] = [];
  for (let minute = startMinute; minute <= startMinute + durationMinutes; minute += APPOINTMENT_SLOT_MINUTES) {
    const candidates = resolveLocalDateTime(localDate, minute);
    if (candidates.length !== 1) throw new AppointmentTimeError();
    boundaries.push(candidates[0]);
  }

  for (let index = 1; index < boundaries.length; index += 1) {
    if (boundaries[index].getTime() - boundaries[index - 1].getTime()
      !== APPOINTMENT_SLOT_MINUTES * 60 * 1000) {
      throw new AppointmentTimeError();
    }
  }

  return {
    startAt: boundaries[0],
    endAt: boundaries[boundaries.length - 1],
    slotStarts: boundaries.slice(0, -1),
  };
}

export function resolveSubmittedStart(startAt: Date, durationMinutes: number): {
  localDate: string;
  startMinute: number;
  interval: ResolvedLocalInterval;
} {
  if (!Number.isFinite(startAt.getTime())
    || startAt.getUTCSeconds() !== 0
    || startAt.getUTCMilliseconds() !== 0) {
    throw new AppointmentTimeError("Der Termin liegt nicht auf dem gültigen Zeitraster.");
  }

  const localDate = instantToLocalDate(startAt);
  const startMinute = instantToLocalMinute(startAt);
  const interval = resolveLocalInterval(localDate, startMinute, durationMinutes);
  if (interval.startAt.getTime() !== startAt.getTime()) throw new AppointmentTimeError();

  return { localDate, startMinute, interval };
}

export function berlinDayBounds(localDate: string): { start: Date; end: Date } {
  const startCandidates = resolveLocalDateTime(localDate, 0);
  const endCandidates = resolveLocalDateTime(addLocalDays(localDate, 1), 0);
  if (startCandidates.length !== 1 || endCandidates.length !== 1) throw new AppointmentTimeError();
  return { start: startCandidates[0], end: endCandidates[0] };
}

export function formatAppointmentDateLabel(localDate: string): string {
  const parsed = parseLocalDate(localDate);
  return dateLabelFormatter.format(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12)));
}

export function formatAppointmentTimeLabel(instant: Date): string {
  return timeLabelFormatter.format(instant);
}
