import {
  getHelpTopics,
  SUGGESTED_QUESTIONS,
  SUGGESTED_QUESTIONS_ES,
} from "./help-knowledge.js";
import { getCopy } from "./copy/index.js";

const MIN_SCORE = 2;
const HIGH_CONFIDENCE = 5;

/**
 * @param {string} text
 */
export function normalizeQuery(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} query
 * @param {string} intent
 */
function tokenOverlap(query, intent) {
  const qTokens = new Set(query.split(" ").filter((t) => t.length > 2));
  const intentTokens = intent.split(" ").filter((t) => t.length > 2);
  let score = 0;
  for (const token of intentTokens) {
    if (qTokens.has(token)) score += 2;
    else if ([...qTokens].some((q) => q.includes(token) || token.includes(q)))
      score += 1;
  }
  if (query.includes(intent)) score += 3;
  return score;
}

/**
 * @param {string} query
 * @param {{ timeMode?: string; activeTool?: string; sessionStatus?: string }} context
 */
export function resolveHelpQuery(query, context = {}) {
  const locale = context.locale === "es" ? "es" : "en";
  const helpTopics = getHelpTopics(locale);
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return {
      matched: false,
      answer: "",
      topicId: null,
      actions: [],
      suggestions: pickSuggestions(context),
      confidence: 0,
    };
  }

  let best =
    /** @type {{ topic: typeof helpTopics[number]; score: number } | null} */ (
      null
    );

  for (const topic of helpTopics) {
    for (const intent of topic.intents) {
      const score = tokenOverlap(normalized, normalizeQuery(intent));
      const contextualBoost =
        (context.timeMode === "morning" && topic.id === "morning-plan"
          ? 1
          : 0) +
        (context.timeMode === "afternoon" && topic.id === "afternoon-focus"
          ? 1
          : 0) +
        (context.timeMode === "evening" && topic.id === "evening-unwind"
          ? 1
          : 0) +
        (context.activeTool === "sessions" && topic.id === "sessions" ? 1 : 0) +
        (context.activeTool === "notes" && topic.id === "quick-notes" ? 1 : 0) +
        (context.activeTool === "preferences" && topic.id === "guard"
          ? 0.5
          : 0) +
        (["focusing", "paused", "recovery"].includes(
          context.sessionStatus || "",
        ) && topic.id === "recovery"
          ? 1
          : 0);

      const total = score + contextualBoost;
      if (!best || total > best.score) {
        best = { topic, score: total };
      }
    }
  }

  if (!best || best.score < MIN_SCORE) {
    return {
      matched: false,
      answer: getCopy(locale).askNoMatch,
      topicId: null,
      actions: [],
      suggestions: pickSuggestions(context),
      confidence: best?.score ?? 0,
    };
  }

  return {
    matched: best.score >= HIGH_CONFIDENCE,
    answer: best.topic.answer,
    topicId: best.topic.id,
    actions: best.topic.actions,
    suggestions: pickSuggestions(context),
    confidence: best.score,
  };
}

/**
 * @param {{ timeMode?: string; activeTool?: string }} context
 */
function pickSuggestions(context) {
  const spanish = context.locale === "es";
  if (spanish) {
    return [
      "¿Cómo inicio enfoque?",
      "¿Dónde veo las sesiones?",
      "¿Cómo funcionan las preferencias?",
    ];
  }
  return [
    "How do I start focus?",
    "Where do sessions appear?",
    "How do preferences work?",
  ];
}

export { getHelpTopics, HELP_TOPICS } from "./help-knowledge.js";
