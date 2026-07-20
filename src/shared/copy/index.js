import { en } from "./en.js";
import { es } from "./es.js";

/** @typedef {'en' | 'es'} AppLocale */

const packs = { en, es };

/** @param {unknown} value */
export function resolveLocale(value) {
  if (value === "es") return "es";
  if (value === "en") return "en";
  if (typeof navigator !== "undefined" && navigator.language?.startsWith("es")) {
    return "es";
  }
  return "en";
}

/** @param {AppLocale | unknown} [locale] */
export function getCopy(locale) {
  return packs[resolveLocale(locale)];
}

/** @param {string} mode @param {number} [index] @param {AppLocale | unknown} [locale] */
export function getMessage(mode, index = 0, locale) {
  const list = getCopy(locale).messages[mode] || getCopy(locale).messages.morning;
  return list[index % list.length];
}

/** @param {import('../../windows/main/types/app').TimeMode} mode @param {AppLocale | unknown} [locale] */
export function getPhaseCopy(mode, locale) {
  return getCopy(locale).phases[mode] || getCopy(locale).phases.morning;
}

/** @deprecated Use getCopy(locale) */
export const copy = en;
