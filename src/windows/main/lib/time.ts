import { getTimeModeFromHour } from "../../../shared/break-rules.js";
import type { AppLocale, TimeMode } from "../types/app";

export function getTimeMode(hour: number): TimeMode {
  return getTimeModeFromHour(hour);
}

export const p2 = (n: number) => String(n).padStart(2, "0");
export const fmtTimer = (s: number) => `${p2(Math.floor(s / 60))}:${p2(s % 60)}`;

export function fmtTime(d: Date, locale: AppLocale = "en") {
  return d.toLocaleTimeString(locale === "es" ? "es-ES" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtTimeAmPm(d: Date, locale: AppLocale = "en") {
  return d.toLocaleTimeString(locale === "es" ? "es-ES" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function fmtDate(d: Date, locale: AppLocale = "en") {
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function moodFromMode(mode: TimeMode) {
  if (mode === "morning") return "bright" as const;
  if (mode === "afternoon") return "focused" as const;
  return "drowsy" as const;
}
