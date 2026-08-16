import "server-only";
import { Prisma } from "../../generated/prisma";
import { prisma } from "../prisma";
import {
  APPOINTMENT_AVAILABILITY_PAGE_DAYS,
  APPOINTMENT_CONFLICT_ERROR,
  APPOINTMENT_SETTINGS_ID,
  APPOINTMENT_SLOT_MINUTES,
  APPOINTMENT_TIME_ZONE,
  GENERIC_APPOINTMENT_ERROR,
  MAX_APPOINTMENT_DURATION_MINUTES,
  MAX_BOOKING_HORIZON_DAYS,
} from "./constants";
import {
  addLocalDays,
  berlinDayBounds,
  compareLocalDates,
  databaseDateToLocalDate,
  formatAppointmentDateLabel,
  formatAppointmentTimeLabel,
  getIsoWeekday,
  getWeekEnd,
  getWeekStart,
  instantToLocalDate,
  localDateToDatabaseDate,
  resolveLocalInterval,
  resolveSubmittedStart,
} from "./time-zone";
import type {
  AdminAppointmentDashboardDto,
  AdminAppointmentDto,
  AdminAppointmentMutationAction,
  AdminAppointmentTypeDto,
  AppointmentAvailabilityDto,
  AppointmentConfigurationDto,
  AppointmentConfirmationModeValue,
  AppointmentExceptionKindValue,
  AppointmentSettingsDto,
  AppointmentSourceValue,
  AppointmentStatusValue,
  AppointmentSummaryDto,
  AvailabilityExceptionDto,
  PublicAppointmentTypeDto,
  WeeklyAvailabilityDto,
} from "./types";

const MAX_TRANSACTION_RETRIES = 3;
const MAX_ADMIN_APPOINTMENTS = 500;
const MAX_CONFIGURATION_EXCEPTIONS = 500;
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/;

type TransactionClient = Prisma.TransactionClient;

type AppointmentDomainErrorCode =
  | "ACCESS"
  | "CONFIGURATION"
  | "CONFLICT"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE";

export class AppointmentDomainError extends Error {
  constructor(
    readonly code: AppointmentDomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppointmentDomainError";
  }
}

interface SettingsRecord {
  slotMinutes: number;
  minimumNoticeMinutes: number;
  bookingHorizonDays: number;
  timeZone: string;
}

interface AppointmentTypeRecord {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  active: boolean;
  onlineBookable: boolean;
  confirmationMode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentRecord {
  id: string;
  appointmentTypeId: string;
  typeNameSnapshot: string;
  durationMinutesSnapshot: number;
  confirmationModeSnapshot: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  details: string | null;
  gdprConsent: boolean;
  startAt: Date;
  endAt: Date;
  status: string;
  source: string;
  revision: number;
  createdAt: Date;
}

interface AuditActor {
  userId: string;
  userName: string;
}

interface TimeInterval {
  startMinute: number;
  endMinute: number;
}

interface ExceptionInterval extends TimeInterval {
  kind: string;
}

interface ReservationPerson {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  details?: string;
  gdprConsent: boolean;
}

function isRetryableTransactionError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export function isAppointmentUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function runAppointmentTransaction<T>(
  operation: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!isRetryableTransactionError(error)) throw error;
      if (attempt === MAX_TRANSACTION_RETRIES) {
        throw new AppointmentDomainError("CONFLICT", APPOINTMENT_CONFLICT_ERROR);
      }
    }
  }

  throw new AppointmentDomainError("CONFLICT", APPOINTMENT_CONFLICT_ERROR);
}

export function safeAppointmentErrorMessage(error: unknown): string {
  if (error instanceof AppointmentDomainError) return error.message;
  if (isAppointmentUniqueConflict(error)) return APPOINTMENT_CONFLICT_ERROR;
  return GENERIC_APPOINTMENT_ERROR;
}

function confirmationMode(value: string): AppointmentConfirmationModeValue {
  if (value === "AUTO" || value === "MANUAL") return value;
  throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
}

function appointmentStatus(value: string): AppointmentStatusValue {
  if (value === "PENDING" || value === "CONFIRMED" || value === "REJECTED" || value === "CANCELLED") {
    return value;
  }
  throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
}

function appointmentSource(value: string): AppointmentSourceValue {
  if (value === "ONLINE" || value === "ADMIN") return value;
  throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
}

function exceptionKind(value: string): AppointmentExceptionKindValue {
  if (value === "OPEN" || value === "BLOCK") return value;
  throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
}

function validateSettings(settings: SettingsRecord | null): SettingsRecord {
  if (!settings
    || settings.slotMinutes !== APPOINTMENT_SLOT_MINUTES
    || settings.timeZone !== APPOINTMENT_TIME_ZONE
    || !Number.isInteger(settings.minimumNoticeMinutes)
    || settings.minimumNoticeMinutes < 0
    || settings.minimumNoticeMinutes > 30 * 24 * 60
    || !Number.isInteger(settings.bookingHorizonDays)
    || settings.bookingHorizonDays < 1
    || settings.bookingHorizonDays > MAX_BOOKING_HORIZON_DAYS) {
    throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
  }
  return settings;
}

function validateAppointmentTypeRecord(type: AppointmentTypeRecord | null): AppointmentTypeRecord {
  if (!type
    || !Number.isInteger(type.durationMinutes)
    || type.durationMinutes < APPOINTMENT_SLOT_MINUTES
    || type.durationMinutes > MAX_APPOINTMENT_DURATION_MINUTES
    || type.durationMinutes % APPOINTMENT_SLOT_MINUTES !== 0) {
    throw new AppointmentDomainError("NOT_FOUND", "Die gewählte Terminart ist nicht verfügbar.");
  }
  confirmationMode(type.confirmationMode);
  return type;
}

function validateAppointmentType(type: AppointmentTypeRecord | null, onlineOnly: boolean): AppointmentTypeRecord {
  const valid = validateAppointmentTypeRecord(type);
  if (!valid.active || (onlineOnly && !valid.onlineBookable)) {
    throw new AppointmentDomainError("NOT_FOUND", "Die gewählte Terminart ist nicht verfügbar.");
  }
  return valid;
}

function validInterval(interval: TimeInterval): boolean {
  return Number.isInteger(interval.startMinute)
    && Number.isInteger(interval.endMinute)
    && interval.startMinute >= 0
    && interval.endMinute <= 24 * 60
    && interval.endMinute > interval.startMinute
    && interval.startMinute % APPOINTMENT_SLOT_MINUTES === 0
    && interval.endMinute % APPOINTMENT_SLOT_MINUTES === 0;
}

function assertValidIntervals(intervals: TimeInterval[]): void {
  if (intervals.some((interval) => !validInterval(interval))) {
    throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
  }
}

function assertValidWeeklyIntervals(intervals: Array<TimeInterval & { weekday: number }>): void {
  assertValidIntervals(intervals);
  if (intervals.some((interval) => !Number.isInteger(interval.weekday)
    || interval.weekday < 1
    || interval.weekday > 7)) {
    throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
  }
}

function assertValidExceptionIntervals(intervals: ExceptionInterval[]): void {
  assertValidIntervals(intervals);
  intervals.forEach((interval) => exceptionKind(interval.kind));
}

function intervalAllowed(
  startMinute: number,
  durationMinutes: number,
  openingIntervals: TimeInterval[],
  blockingIntervals: TimeInterval[],
): boolean {
  for (let minute = startMinute; minute < startMinute + durationMinutes; minute += APPOINTMENT_SLOT_MINUTES) {
    const stepEnd = minute + APPOINTMENT_SLOT_MINUTES;
    const covered = openingIntervals.some(
      (interval) => interval.startMinute <= minute && interval.endMinute >= stepEnd,
    );
    const blocked = blockingIntervals.some(
      (interval) => interval.startMinute < stepEnd && interval.endMinute > minute,
    );
    if (!covered || blocked) return false;
  }
  return true;
}

async function loadSettings(tx: TransactionClient): Promise<SettingsRecord> {
  const settings = await tx.appointmentSettings.findUnique({
    where: { id: APPOINTMENT_SETTINGS_ID },
    select: {
      slotMinutes: true,
      minimumNoticeMinutes: true,
      bookingHorizonDays: true,
      timeZone: true,
    },
  });
  return validateSettings(settings);
}

async function loadAppointmentType(
  tx: TransactionClient,
  appointmentTypeId: string,
  onlineOnly: boolean,
): Promise<AppointmentTypeRecord> {
  const type = await tx.appointmentType.findUnique({
    where: { id: appointmentTypeId },
  });
  return validateAppointmentType(type, onlineOnly);
}

function publicTypeDto(type: AppointmentTypeRecord): PublicAppointmentTypeDto {
  return {
    id: type.id,
    name: type.name,
    description: type.description,
    durationMinutes: type.durationMinutes,
    confirmationMode: confirmationMode(type.confirmationMode),
  };
}

export function serializeAppointmentSummary(appointment: AppointmentRecord): AppointmentSummaryDto {
  const localDate = instantToLocalDate(appointment.startAt);
  return {
    typeName: appointment.typeNameSnapshot,
    durationMinutes: appointment.durationMinutesSnapshot,
    confirmationMode: confirmationMode(appointment.confirmationModeSnapshot),
    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),
    localDate,
    dateLabel: formatAppointmentDateLabel(localDate),
    startLabel: formatAppointmentTimeLabel(appointment.startAt),
    endLabel: formatAppointmentTimeLabel(appointment.endAt),
    status: appointmentStatus(appointment.status),
  };
}

export function serializeManagedAppointment(appointment: AppointmentRecord, now = new Date()) {
  const status = appointmentStatus(appointment.status);
  const canManage = (status === "PENDING" || status === "CONFIRMED")
    && appointment.startAt.getTime() > now.getTime();
  return {
    ...serializeAppointmentSummary(appointment),
    canReschedule: canManage,
    canCancel: canManage,
  };
}

function appointmentSnapshotType(
  currentType: AppointmentTypeRecord,
  appointment: Pick<
    AppointmentRecord,
    "typeNameSnapshot" | "durationMinutesSnapshot" | "confirmationModeSnapshot"
  >,
): AppointmentTypeRecord {
  return validateAppointmentTypeRecord({
    ...currentType,
    name: appointment.typeNameSnapshot,
    durationMinutes: appointment.durationMinutesSnapshot,
    confirmationMode: appointment.confirmationModeSnapshot,
  });
}

export function serializeAdminAppointment(appointment: AppointmentRecord): AdminAppointmentDto {
  return {
    ...serializeAppointmentSummary(appointment),
    id: appointment.id,
    appointmentTypeId: appointment.appointmentTypeId,
    firstName: appointment.firstName,
    lastName: appointment.lastName,
    countryCode: appointment.countryCode,
    phone: appointment.phone,
    details: appointment.details,
    gdprConsent: appointment.gdprConsent,
    source: appointmentSource(appointment.source),
    revision: appointment.revision,
    createdAt: appointment.createdAt.toISOString(),
  };
}

export async function getPublicTypes(): Promise<PublicAppointmentTypeDto[]> {
  const types = await prisma.appointmentType.findMany({
    where: { active: true, onlineBookable: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
  return types.map((type) => publicTypeDto(validateAppointmentType(type, true)));
}

function availabilityDateRange(
  settings: SettingsRecord,
  cursor: string | undefined,
  now: Date,
): { today: string; startDate: string; endDate: string; horizonDate: string } | null {
  const today = instantToLocalDate(now);
  const horizonDate = addLocalDays(today, settings.bookingHorizonDays);
  const requestedStart = cursor && compareLocalDates(cursor, today) > 0 ? cursor : today;
  if (compareLocalDates(requestedStart, horizonDate) > 0) return null;

  const pageEnd = addLocalDays(requestedStart, APPOINTMENT_AVAILABILITY_PAGE_DAYS - 1);
  return {
    today,
    startDate: requestedStart,
    endDate: compareLocalDates(pageEnd, horizonDate) > 0 ? horizonDate : pageEnd,
    horizonDate,
  };
}

export async function buildAppointmentAvailability(
  appointmentTypeId: string,
  cursor: string | undefined,
  onlineOnly: boolean,
  now = new Date(),
  excludeAppointmentId?: string,
): Promise<AppointmentAvailabilityDto> {
  return runAppointmentTransaction(async (tx) => {
    const [settings, currentType] = await Promise.all([
      loadSettings(tx),
      loadAppointmentType(tx, appointmentTypeId, onlineOnly),
    ]);
    let type = currentType;
    if (excludeAppointmentId) {
      const excludedAppointment = await tx.appointment.findUnique({
        where: { id: excludeAppointmentId },
        select: {
          appointmentTypeId: true,
          typeNameSnapshot: true,
          durationMinutesSnapshot: true,
          confirmationModeSnapshot: true,
          startAt: true,
          status: true,
        },
      });
      if (!excludedAppointment
        || excludedAppointment.appointmentTypeId !== appointmentTypeId
        || (excludedAppointment.status !== "PENDING" && excludedAppointment.status !== "CONFIRMED")
        || excludedAppointment.startAt.getTime() <= now.getTime()) {
        throw new AppointmentDomainError("INVALID", "Der Termin kann nicht verschoben werden.");
      }
      type = appointmentSnapshotType(currentType, excludedAppointment);
    }
    const range = availabilityDateRange(settings, cursor, now);
    if (!range) return { days: [], nextCursor: null };

    const startBounds = berlinDayBounds(range.startDate);
    const endBounds = berlinDayBounds(range.endDate);
    const [weekly, exceptions, occupied] = await Promise.all([
      tx.appointmentWeeklyAvailability.findMany({
        select: { weekday: true, startMinute: true, endMinute: true },
      }),
      tx.appointmentAvailabilityException.findMany({
        where: {
          localDate: {
            gte: localDateToDatabaseDate(range.startDate),
            lte: localDateToDatabaseDate(range.endDate),
          },
        },
        select: { localDate: true, kind: true, startMinute: true, endMinute: true },
      }),
      tx.appointmentSlot.findMany({
        where: {
          slotStartAt: { gte: startBounds.start, lt: endBounds.end },
          ...(excludeAppointmentId ? { appointmentId: { not: excludeAppointmentId } } : {}),
        },
        select: { slotStartAt: true },
      }),
    ]);

    assertValidWeeklyIntervals(weekly);
    assertValidExceptionIntervals(exceptions);
    const occupiedTimestamps = new Set(occupied.map((slot) => slot.slotStartAt.getTime()));
    const days: AppointmentAvailabilityDto["days"] = [];
    const earliestAllowed = now.getTime() + settings.minimumNoticeMinutes * 60 * 1000;

    for (let localDate = range.startDate;
      compareLocalDates(localDate, range.endDate) <= 0;
      localDate = addLocalDays(localDate, 1)) {
      const weekday = getIsoWeekday(localDate);
      const dateExceptions = exceptions.filter(
        (entry) => databaseDateToLocalDate(entry.localDate) === localDate,
      );
      const openingIntervals: TimeInterval[] = [
        ...weekly.filter((entry) => entry.weekday === weekday),
        ...dateExceptions.filter((entry) => entry.kind === "OPEN"),
      ];
      const blockingIntervals = dateExceptions.filter((entry) => entry.kind === "BLOCK");
      const slots = [];

      for (let startMinute = 0;
        startMinute + type.durationMinutes <= 24 * 60;
        startMinute += APPOINTMENT_SLOT_MINUTES) {
        if (!intervalAllowed(startMinute, type.durationMinutes, openingIntervals, blockingIntervals)) continue;

        try {
          const interval = resolveLocalInterval(localDate, startMinute, type.durationMinutes);
          if (interval.startAt.getTime() < earliestAllowed) continue;
          if (interval.slotStarts.some((slot) => occupiedTimestamps.has(slot.getTime()))) continue;
          slots.push({
            startAt: interval.startAt.toISOString(),
            startLabel: formatAppointmentTimeLabel(interval.startAt),
            endLabel: formatAppointmentTimeLabel(interval.endAt),
          });
        } catch {
          // DST-Luecken, doppelte Zeiten und DST-uebergreifende Intervalle bleiben unsichtbar.
        }
      }

      if (slots.length > 0) {
        days.push({ date: localDate, dateLabel: formatAppointmentDateLabel(localDate), slots });
      }
    }

    return {
      days,
      nextCursor: compareLocalDates(range.endDate, range.horizonDate) < 0
        ? addLocalDays(range.endDate, 1)
        : null,
    };
  });
}

async function assertStartAvailable(
  tx: TransactionClient,
  type: AppointmentTypeRecord,
  settings: SettingsRecord,
  submittedStart: Date,
  now: Date,
  excludeAppointmentId?: string,
): Promise<ReturnType<typeof resolveSubmittedStart>["interval"]> {
  const resolved = resolveSubmittedStart(submittedStart, type.durationMinutes);
  const today = instantToLocalDate(now);
  const horizon = addLocalDays(today, settings.bookingHorizonDays);
  if (compareLocalDates(resolved.localDate, today) < 0
    || compareLocalDates(resolved.localDate, horizon) > 0
    || resolved.interval.startAt.getTime()
      < now.getTime() + settings.minimumNoticeMinutes * 60 * 1000) {
    throw new AppointmentDomainError("INVALID", "Der gewählte Termin liegt außerhalb des Buchungszeitraums.");
  }

  const [weekly, exceptions] = await Promise.all([
    tx.appointmentWeeklyAvailability.findMany({
      where: { weekday: getIsoWeekday(resolved.localDate) },
      select: { startMinute: true, endMinute: true },
    }),
    tx.appointmentAvailabilityException.findMany({
      where: { localDate: localDateToDatabaseDate(resolved.localDate) },
      select: { kind: true, startMinute: true, endMinute: true },
    }),
  ]);
  assertValidIntervals(weekly);
  assertValidExceptionIntervals(exceptions);
  const openingIntervals: TimeInterval[] = [
    ...weekly,
    ...exceptions.filter((entry) => entry.kind === "OPEN"),
  ];
  const blockingIntervals = exceptions.filter((entry) => entry.kind === "BLOCK");
  if (!intervalAllowed(
    resolved.startMinute,
    type.durationMinutes,
    openingIntervals,
    blockingIntervals,
  )) {
    throw new AppointmentDomainError("INVALID", APPOINTMENT_CONFLICT_ERROR);
  }

  const occupied = await tx.appointmentSlot.findFirst({
    where: {
      slotStartAt: { in: resolved.interval.slotStarts },
      ...(excludeAppointmentId ? { appointmentId: { not: excludeAppointmentId } } : {}),
    },
    select: { appointmentId: true },
  });
  if (occupied) throw new AppointmentDomainError("CONFLICT", APPOINTMENT_CONFLICT_ERROR);
  return resolved.interval;
}

function statusForType(type: AppointmentTypeRecord): AppointmentStatusValue {
  return confirmationMode(type.confirmationMode) === "AUTO" ? "CONFIRMED" : "PENDING";
}

async function writeAudit(
  tx: TransactionClient,
  actor: AuditActor,
  action: string,
  details: string,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: actor.userId,
      userName: actor.userName,
      action,
      details,
    },
  });
}

export async function createAppointmentReservation(input: {
  appointmentTypeId: string;
  startAt: Date;
  person: ReservationPerson;
  source: AppointmentSourceValue;
  onlineOnly: boolean;
  managementCodeHash?: string;
  auditActor?: AuditActor;
  now?: Date;
}): Promise<AppointmentRecord> {
  if (!input.person.gdprConsent) {
    throw new AppointmentDomainError("INVALID", "Die Einwilligung ist erforderlich.");
  }
  if ((input.source === "ONLINE"
      && (!input.managementCodeHash || !SHA256_HEX_PATTERN.test(input.managementCodeHash)))
    || (input.source === "ADMIN" && input.managementCodeHash !== undefined)) {
    throw new AppointmentDomainError("INVALID", GENERIC_APPOINTMENT_ERROR);
  }
  return runAppointmentTransaction(async (tx) => {
    const [settings, type] = await Promise.all([
      loadSettings(tx),
      loadAppointmentType(tx, input.appointmentTypeId, input.onlineOnly),
    ]);
    const interval = await assertStartAvailable(tx, type, settings, input.startAt, input.now ?? new Date());
    const appointment = await tx.appointment.create({
      data: {
        appointmentTypeId: type.id,
        typeNameSnapshot: type.name,
        durationMinutesSnapshot: type.durationMinutes,
        confirmationModeSnapshot: confirmationMode(type.confirmationMode),
        firstName: input.person.firstName,
        lastName: input.person.lastName,
        countryCode: input.person.countryCode,
        phone: input.person.phone,
        details: input.person.details,
        gdprConsent: input.person.gdprConsent,
        startAt: interval.startAt,
        endAt: interval.endAt,
        status: statusForType(type),
        source: input.source,
        managementCodeHash: input.managementCodeHash,
      },
    });
    await tx.appointmentSlot.createMany({
      data: interval.slotStarts.map((slotStartAt) => ({
        appointmentId: appointment.id,
        slotStartAt,
      })),
    });

    if (input.auditActor) {
      await writeAudit(
        tx,
        input.auditActor,
        "CREATE_APPOINTMENT",
        `Termin erstellt (ID: ${appointment.id}, Status: ${appointment.status})`,
      );
    }
    return appointment;
  });
}

async function loadManagedAppointment(
  tx: TransactionClient,
  sessionTokenHash: string,
  now: Date,
): Promise<AppointmentRecord> {
  if (!SHA256_HEX_PATTERN.test(sessionTokenHash)) {
    throw new AppointmentDomainError("ACCESS", "Der Zugang ist ungültig oder abgelaufen.");
  }
  const access = await tx.appointmentAccessSession.findUnique({
    where: { tokenHash: sessionTokenHash },
    include: { appointment: true },
  });
  if (!access || access.expiresAt <= now) {
    throw new AppointmentDomainError("ACCESS", "Der Zugang ist ungültig oder abgelaufen.");
  }
  return access.appointment;
}

export async function exchangeManagementCode(input: {
  managementCodeHash: string;
  sessionTokenHash: string;
  expiresAt: Date;
}): Promise<AppointmentRecord> {
  if (!SHA256_HEX_PATTERN.test(input.managementCodeHash)
    || !SHA256_HEX_PATTERN.test(input.sessionTokenHash)) {
    throw new AppointmentDomainError("ACCESS", "Der Zugang ist ungültig oder abgelaufen.");
  }
  return runAppointmentTransaction(async (tx) => {
    await tx.appointmentAccessSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    const appointment = await tx.appointment.findUnique({
      where: { managementCodeHash: input.managementCodeHash },
    });
    if (!appointment) {
      throw new AppointmentDomainError("ACCESS", "Der Zugang ist ungültig oder abgelaufen.");
    }
    await tx.appointmentAccessSession.upsert({
      where: { appointmentId: appointment.id },
      update: { tokenHash: input.sessionTokenHash, expiresAt: input.expiresAt },
      create: {
        appointmentId: appointment.id,
        tokenHash: input.sessionTokenHash,
        expiresAt: input.expiresAt,
      },
    });
    return appointment;
  });
}

export async function getManagedAppointmentBySession(
  sessionTokenHash: string,
  now = new Date(),
): Promise<AppointmentRecord> {
  if (!SHA256_HEX_PATTERN.test(sessionTokenHash)) {
    throw new AppointmentDomainError("ACCESS", "Der Zugang ist ungültig oder abgelaufen.");
  }
  return runAppointmentTransaction((tx) => loadManagedAppointment(tx, sessionTokenHash, now));
}

export async function deleteManagedSession(sessionTokenHash: string): Promise<void> {
  if (!SHA256_HEX_PATTERN.test(sessionTokenHash)) return;
  await runAppointmentTransaction(async (tx) => {
    await tx.appointmentAccessSession.deleteMany({ where: { tokenHash: sessionTokenHash } });
  });
}

async function claimAppointment(
  tx: TransactionClient,
  appointment: AppointmentRecord,
  expectedRevision: number,
): Promise<void> {
  const claimed = await tx.appointment.updateMany({
    where: {
      id: appointment.id,
      revision: expectedRevision,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    data: { revision: { increment: 1 } },
  });
  if (claimed.count !== 1) {
    throw new AppointmentDomainError("STALE", "Der Termin wurde zwischenzeitlich geändert.");
  }
}

async function assertManagedSessionStillActive(
  tx: TransactionClient,
  sessionTokenHash: string,
): Promise<void> {
  const activeSession = await tx.appointmentAccessSession.count({
    where: { tokenHash: sessionTokenHash, expiresAt: { gt: new Date() } },
  });
  if (activeSession !== 1) {
    throw new AppointmentDomainError("ACCESS", "Der Zugang ist ungültig oder abgelaufen.");
  }
}

async function rescheduleAppointment(
  tx: TransactionClient,
  appointment: AppointmentRecord,
  expectedRevision: number,
  submittedStart: Date,
  onlineOnly: boolean,
  now: Date,
  auditActor?: AuditActor,
  requiredSessionTokenHash?: string,
): Promise<AppointmentRecord> {
  if (appointment.startAt.getTime() <= now.getTime()) {
    throw new AppointmentDomainError("INVALID", "Dieser Termin kann nicht mehr verschoben werden.");
  }

  const [settings, currentType] = await Promise.all([
    loadSettings(tx),
    loadAppointmentType(tx, appointment.appointmentTypeId, onlineOnly),
  ]);
  const type = appointmentSnapshotType(currentType, appointment);
  const oldSlots = await tx.appointmentSlot.findMany({
    where: { appointmentId: appointment.id },
    select: { slotStartAt: true },
  });
  await claimAppointment(tx, appointment, expectedRevision);
  if (requiredSessionTokenHash) {
    await assertManagedSessionStillActive(tx, requiredSessionTokenHash);
  }
  const interval = await assertStartAvailable(
    tx,
    type,
    settings,
    submittedStart,
    now,
    appointment.id,
  );
  const oldTimestamps = new Set(oldSlots.map((slot) => slot.slotStartAt.getTime()));
  const newTimestamps = new Set(interval.slotStarts.map((slot) => slot.getTime()));
  const slotsToCreate = interval.slotStarts.filter((slot) => !oldTimestamps.has(slot.getTime()));
  if (slotsToCreate.length > 0) {
    await tx.appointmentSlot.createMany({
      data: slotsToCreate.map((slotStartAt) => ({ appointmentId: appointment.id, slotStartAt })),
    });
  }
  const updated = await tx.appointment.update({
    where: { id: appointment.id },
    data: {
      startAt: interval.startAt,
      endAt: interval.endAt,
      status: statusForType(type),
    },
  });
  const slotsToDelete = oldSlots
    .filter((slot) => !newTimestamps.has(slot.slotStartAt.getTime()))
    .map((slot) => slot.slotStartAt);
  if (slotsToDelete.length > 0) {
    await tx.appointmentSlot.deleteMany({
      where: { appointmentId: appointment.id, slotStartAt: { in: slotsToDelete } },
    });
  }
  if (auditActor) {
    await writeAudit(
      tx,
      auditActor,
      "RESCHEDULE_APPOINTMENT",
      `Termin verschoben (ID: ${appointment.id}, Status: ${updated.status})`,
    );
  }
  return updated;
}

export async function rescheduleManagedReservation(
  sessionTokenHash: string,
  submittedStart: Date,
  now?: Date,
): Promise<AppointmentRecord> {
  const operationNow = now ?? new Date();
  const initialAppointment = await getManagedAppointmentBySession(sessionTokenHash, operationNow);
  const expectedRevision = initialAppointment.revision;

  return runAppointmentTransaction(async (tx) => {
    const appointment = await loadManagedAppointment(tx, sessionTokenHash, operationNow);
    return rescheduleAppointment(
      tx,
      appointment,
      expectedRevision,
      submittedStart,
      true,
      operationNow,
      undefined,
      sessionTokenHash,
    );
  });
}

export async function cancelManagedReservation(
  sessionTokenHash: string,
  now?: Date,
): Promise<AppointmentRecord> {
  const operationNow = now ?? new Date();
  const initialAppointment = await getManagedAppointmentBySession(sessionTokenHash, operationNow);
  const expectedRevision = initialAppointment.revision;

  return runAppointmentTransaction(async (tx) => {
    const appointment = await loadManagedAppointment(tx, sessionTokenHash, operationNow);
    if (appointment.status === "CANCELLED") return appointment;
    if (appointment.status === "REJECTED") {
      throw new AppointmentDomainError("INVALID", "Dieser Termin kann nicht storniert werden.");
    }
    if (appointment.startAt.getTime() <= operationNow.getTime()) {
      throw new AppointmentDomainError("INVALID", "Dieser Termin kann nicht mehr storniert werden.");
    }
    await claimAppointment(tx, appointment, expectedRevision);
    await assertManagedSessionStillActive(tx, sessionTokenHash);
    await tx.appointmentSlot.deleteMany({ where: { appointmentId: appointment.id } });
    return tx.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });
  });
}

export async function getManagedAvailability(
  sessionTokenHash: string,
  cursor: string | undefined,
  now = new Date(),
): Promise<AppointmentAvailabilityDto> {
  const appointment = await getManagedAppointmentBySession(sessionTokenHash, now);
  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    throw new AppointmentDomainError("INVALID", "Dieser Termin kann nicht mehr verschoben werden.");
  }
  if (appointment.startAt.getTime() <= now.getTime()) {
    throw new AppointmentDomainError("INVALID", "Dieser Termin kann nicht mehr verschoben werden.");
  }
  return buildAppointmentAvailability(appointment.appointmentTypeId, cursor, true, now, appointment.id);
}

export async function mutateAdminReservation(input: {
  appointmentId: string;
  expectedRevision: number;
  action: AdminAppointmentMutationAction;
  auditActor: AuditActor;
}): Promise<AppointmentRecord> {
  return runAppointmentTransaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({ where: { id: input.appointmentId } });
    if (!appointment) throw new AppointmentDomainError("NOT_FOUND", "Termin nicht gefunden.");

    const allowedStatuses = input.action === "CANCEL" ? ["PENDING", "CONFIRMED"] : ["PENDING"];
    if (!allowedStatuses.includes(appointment.status)) {
      throw new AppointmentDomainError("INVALID", "Diese Statusänderung ist nicht möglich.");
    }
    if (input.action === "CONFIRM") {
      const slotCount = await tx.appointmentSlot.count({ where: { appointmentId: appointment.id } });
      if (slotCount !== appointment.durationMinutesSnapshot / APPOINTMENT_SLOT_MINUTES) {
        throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
      }
    }

    const targetStatus: AppointmentStatusValue = input.action === "CONFIRM"
      ? "CONFIRMED"
      : input.action === "REJECT"
        ? "REJECTED"
        : "CANCELLED";
    const updated = await tx.appointment.updateMany({
      where: {
        id: appointment.id,
        revision: input.expectedRevision,
        status: { in: allowedStatuses as AppointmentStatusValue[] },
      },
      data: { status: targetStatus, revision: { increment: 1 } },
    });
    if (updated.count !== 1) {
      throw new AppointmentDomainError("STALE", "Der Termin wurde zwischenzeitlich geändert.");
    }
    if (targetStatus === "REJECTED" || targetStatus === "CANCELLED") {
      await tx.appointmentSlot.deleteMany({ where: { appointmentId: appointment.id } });
    }
    await writeAudit(
      tx,
      input.auditActor,
      `${input.action}_APPOINTMENT`,
      `Terminstatus geändert (ID: ${appointment.id}, Status: ${targetStatus})`,
    );
    return tx.appointment.findUniqueOrThrow({ where: { id: appointment.id } });
  });
}

export async function rescheduleAdminReservation(input: {
  appointmentId: string;
  expectedRevision: number;
  submittedStart: Date;
  auditActor: AuditActor;
  now?: Date;
}): Promise<AppointmentRecord> {
  return runAppointmentTransaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({ where: { id: input.appointmentId } });
    if (!appointment) throw new AppointmentDomainError("NOT_FOUND", "Termin nicht gefunden.");
    return rescheduleAppointment(
      tx,
      appointment,
      input.expectedRevision,
      input.submittedStart,
      false,
      input.now ?? new Date(),
      input.auditActor,
    );
  });
}

export async function getAdminDashboardData(
  requestedWeekStart: string | undefined,
  now = new Date(),
): Promise<AdminAppointmentDashboardDto> {
  const todayLocalDate = instantToLocalDate(now);
  const weekStart = getWeekStart(requestedWeekStart ?? todayLocalDate);
  const weekEnd = getWeekEnd(weekStart);
  const todayBounds = berlinDayBounds(todayLocalDate);
  const weekStartBounds = berlinDayBounds(weekStart);
  const weekEndBounds = berlinDayBounds(weekEnd);

  return runAppointmentTransaction(async (tx) => {
    const [appointments, manualTypes, pendingCount, todayCount, weekCount] = await Promise.all([
      tx.appointment.findMany({
        where: {
          OR: [
            { status: "PENDING" },
            { startAt: { gte: weekStartBounds.start, lt: weekEndBounds.end } },
          ],
        },
        orderBy: [{ startAt: "asc" }, { id: "asc" }],
        take: MAX_ADMIN_APPOINTMENTS,
      }),
      tx.appointmentType.findMany({
        where: { active: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      tx.appointment.count({ where: { status: "PENDING" } }),
      tx.appointment.count({
        where: { startAt: { gte: todayBounds.start, lt: todayBounds.end } },
      }),
      tx.appointment.count({
        where: { startAt: { gte: weekStartBounds.start, lt: weekEndBounds.end } },
      }),
    ]);

    return {
      appointments: appointments.map(serializeAdminAppointment),
      manualAppointmentTypes: manualTypes.map((type) => publicTypeDto(validateAppointmentType(type, false))),
      todayLocalDate,
      weekStart,
      weekEnd,
      pendingCount,
      todayCount,
      weekCount,
    };
  });
}

export async function getConfigurationData(now = new Date()): Promise<AppointmentConfigurationDto> {
  return runAppointmentTransaction(async (tx) => {
    const [settings, types, weekly, exceptions] = await Promise.all([
      loadSettings(tx),
      tx.appointmentType.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }, { id: "asc" }] }),
      tx.appointmentWeeklyAvailability.findMany({
        orderBy: [{ weekday: "asc" }, { startMinute: "asc" }, { id: "asc" }],
      }),
      tx.appointmentAvailabilityException.findMany({
        where: { localDate: { gte: localDateToDatabaseDate(instantToLocalDate(now)) } },
        orderBy: [{ localDate: "asc" }, { startMinute: "asc" }, { id: "asc" }],
        take: MAX_CONFIGURATION_EXCEPTIONS,
      }),
    ]);
    assertValidWeeklyIntervals(weekly);
    assertValidExceptionIntervals(exceptions);
    return {
      settings: serializeSettings(settings),
      appointmentTypes: types.map(serializeAdminType),
      weeklyAvailability: weekly.map(serializeWeekly),
      exceptions: exceptions.map(serializeException),
    };
  });
}

export function serializeSettings(settings: SettingsRecord): AppointmentSettingsDto {
  const valid = validateSettings(settings);
  return {
    slotMinutes: valid.slotMinutes,
    minimumNoticeMinutes: valid.minimumNoticeMinutes,
    bookingHorizonDays: valid.bookingHorizonDays,
    timeZone: valid.timeZone,
  };
}

export function serializeAdminType(type: AppointmentTypeRecord): AdminAppointmentTypeDto {
  const valid = validateAppointmentTypeRecord(type);
  if (!type.createdAt || !type.updatedAt) {
    throw new AppointmentDomainError("CONFIGURATION", GENERIC_APPOINTMENT_ERROR);
  }
  return {
    ...publicTypeDto(valid),
    active: type.active,
    onlineBookable: type.onlineBookable,
    createdAt: type.createdAt.toISOString(),
    updatedAt: type.updatedAt.toISOString(),
  };
}

export function serializeWeekly(entry: {
  id: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
}): WeeklyAvailabilityDto {
  assertValidWeeklyIntervals([entry]);
  return {
    id: entry.id,
    weekday: entry.weekday,
    startMinute: entry.startMinute,
    endMinute: entry.endMinute,
  };
}

export function serializeException(entry: {
  id: string;
  localDate: Date;
  kind: string;
  startMinute: number;
  endMinute: number;
}): AvailabilityExceptionDto {
  assertValidExceptionIntervals([entry]);
  return {
    id: entry.id,
    localDate: databaseDateToLocalDate(entry.localDate),
    kind: exceptionKind(entry.kind),
    startMinute: entry.startMinute,
    endMinute: entry.endMinute,
  };
}

export async function createConfigurationType(input: {
  name: string;
  description?: string;
  durationMinutes: number;
  active: boolean;
  onlineBookable: boolean;
  confirmationMode: AppointmentConfirmationModeValue;
}, actor: AuditActor): Promise<AdminAppointmentTypeDto> {
  return runAppointmentTransaction(async (tx) => {
    const created = await tx.appointmentType.create({ data: input });
    await writeAudit(tx, actor, "CREATE_APPOINTMENT_TYPE", `Terminart erstellt (ID: ${created.id})`);
    return serializeAdminType(created);
  });
}

export async function updateConfigurationType(input: {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  active: boolean;
  onlineBookable: boolean;
  confirmationMode: AppointmentConfirmationModeValue;
}, actor: AuditActor): Promise<AdminAppointmentTypeDto> {
  return runAppointmentTransaction(async (tx) => {
    const updated = await tx.appointmentType.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description ?? null,
        durationMinutes: input.durationMinutes,
        active: input.active,
        onlineBookable: input.onlineBookable,
        confirmationMode: input.confirmationMode,
      },
    });
    await writeAudit(tx, actor, "UPDATE_APPOINTMENT_TYPE", `Terminart geändert (ID: ${updated.id})`);
    return serializeAdminType(updated);
  });
}

export async function createConfigurationWeekly(input: {
  weekday: number;
  startMinute: number;
  endMinute: number;
}, actor: AuditActor): Promise<WeeklyAvailabilityDto> {
  return runAppointmentTransaction(async (tx) => {
    const created = await tx.appointmentWeeklyAvailability.create({ data: input });
    await writeAudit(tx, actor, "CREATE_WEEKLY_AVAILABILITY", `Wochenfenster erstellt (ID: ${created.id})`);
    return serializeWeekly(created);
  });
}

export async function deleteConfigurationWeekly(id: string, actor: AuditActor): Promise<void> {
  await runAppointmentTransaction(async (tx) => {
    const deleted = await tx.appointmentWeeklyAvailability.deleteMany({ where: { id } });
    if (deleted.count !== 1) throw new AppointmentDomainError("NOT_FOUND", "Wochenfenster nicht gefunden.");
    await writeAudit(tx, actor, "DELETE_WEEKLY_AVAILABILITY", `Wochenfenster gelöscht (ID: ${id})`);
  });
}

export async function createConfigurationException(input: {
  localDate: string;
  kind: AppointmentExceptionKindValue;
  startMinute: number;
  endMinute: number;
}, actor: AuditActor): Promise<AvailabilityExceptionDto> {
  return runAppointmentTransaction(async (tx) => {
    const created = await tx.appointmentAvailabilityException.create({
      data: {
        localDate: localDateToDatabaseDate(input.localDate),
        kind: input.kind,
        startMinute: input.startMinute,
        endMinute: input.endMinute,
      },
    });
    await writeAudit(tx, actor, "CREATE_AVAILABILITY_EXCEPTION", `Ausnahme erstellt (ID: ${created.id})`);
    return serializeException(created);
  });
}

export async function deleteConfigurationException(id: string, actor: AuditActor): Promise<void> {
  await runAppointmentTransaction(async (tx) => {
    const deleted = await tx.appointmentAvailabilityException.deleteMany({ where: { id } });
    if (deleted.count !== 1) throw new AppointmentDomainError("NOT_FOUND", "Ausnahme nicht gefunden.");
    await writeAudit(tx, actor, "DELETE_AVAILABILITY_EXCEPTION", `Ausnahme gelöscht (ID: ${id})`);
  });
}

export async function updateConfigurationSettings(input: {
  minimumNoticeMinutes: number;
  bookingHorizonDays: number;
}, actor: AuditActor): Promise<AppointmentSettingsDto> {
  return runAppointmentTransaction(async (tx) => {
    const updated = await tx.appointmentSettings.upsert({
      where: { id: APPOINTMENT_SETTINGS_ID },
      update: {
        slotMinutes: APPOINTMENT_SLOT_MINUTES,
        minimumNoticeMinutes: input.minimumNoticeMinutes,
        bookingHorizonDays: input.bookingHorizonDays,
        timeZone: APPOINTMENT_TIME_ZONE,
      },
      create: {
        id: APPOINTMENT_SETTINGS_ID,
        slotMinutes: APPOINTMENT_SLOT_MINUTES,
        minimumNoticeMinutes: input.minimumNoticeMinutes,
        bookingHorizonDays: input.bookingHorizonDays,
        timeZone: APPOINTMENT_TIME_ZONE,
      },
    });
    await writeAudit(tx, actor, "UPDATE_BOOKING_SETTINGS", "Buchungsregeln geändert");
    return serializeSettings(updated);
  });
}
