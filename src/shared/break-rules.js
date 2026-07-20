/**
 * Break lengths used by the session machine and the help window.
 * Kept in one place so both stay in sync.
 */
export const BREAK_RULES = [
  { maxMinutes: 25, breakMinutes: 5, label: "Under 25 min" },
  { maxMinutes: 50, breakMinutes: 8, label: "25 to 50 min" },
  { maxMinutes: 90, breakMinutes: 15, label: "50 to 90 min" },
  { maxMinutes: Infinity, breakMinutes: 20, label: "Over 90 min" },
];

/**
 * @param {number} workedMinutes
 * @returns {number}
 */
export function getBreakMinutes(workedMinutes) {
  const minutes = Math.max(0, workedMinutes);
  const rule = BREAK_RULES.find((entry) => minutes < entry.maxMinutes);
  return rule ? rule.breakMinutes : 20;
}

/**
 * Morning starts at 6, afternoon at 18, night at 21.
 * @param {number} hour 0-23
 * @returns {"morning" | "afternoon" | "evening"}
 */
export function getTimeModeFromHour(hour) {
  if (hour >= 18 && hour < 21) return "afternoon";
  if (hour >= 21 || hour < 6) return "evening";
  return "morning";
}

export const MODE_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const MODE_HOURS = {
  morning: "6:00 – 17:59",
  afternoon: "18:00 – 20:59",
  evening: "21:00 – 5:59",
};
