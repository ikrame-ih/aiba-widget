export const DATA_VERSION = 8;

export const DEFAULT_BLOCKED_SITES = [
  "twitter.com",
  "x.com",
  "reddit.com",
  "youtube.com",
];

export const DEFAULT_FOCUS_SESSION = {
  status: "idle",
  phaseStartedAt: null,
  accumulatedSeconds: 0,
  plannedMinutes: 25,
  recoveryMinutes: 8,
  objective: "",
  skill: 3,
  challenge: 3,
  energy: 3,
  taskType: "deep",
  feedbackMetric: "milestone",
  interruptions: 0,
};

export const DEFAULT_DATA = {
  version: DATA_VERSION,
  priorities: [],
  completedToday: [],
  dailyOutcome: "",
  openLoops: "",
  brainDump: "",
  primaryTaskId: null,
  widgetMode: "compact",
  flowSessions: [],
  shutdown: {
    sessionOutcome: "",
    disposition: "continue",
    nextAction: "",
    nextBlockAt: "",
    complete: false,
  },
  focusSession: structuredClone(DEFAULT_FOCUS_SESSION),
  onboardingSeen: {
    firstTask: false,
    firstFocus: false,
    firstShutdown: false,
  },
  settings: {
    theme: "dark",
    language: "en",
    reducedMotion: false,
    timeMode: "morning",
    deepWorkGuard: false,
    tunnelVision: false,
    blockedSites: [...DEFAULT_BLOCKED_SITES],
    blockedApps: [],
    helperEnabled: false,
    displayName: "",
  },
};

/**
 * @param {unknown} raw
 */
export function migrateData(raw) {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_DATA);
  }

  const legacy = /** @type {Record<string, unknown>} */ (raw);

  if (legacy.version === DATA_VERSION) {
    return normalizeData(legacy);
  }

  if (
    legacy.version === 7 ||
    legacy.version === 6 ||
    legacy.version === 5 ||
    legacy.version === 4 ||
    legacy.version === 2 ||
    legacy.version === 3
  ) {
    const migrated = normalizeData(legacy);
    migrated.version = DATA_VERSION;
    return migrated;
  }

  const migrated = structuredClone(DEFAULT_DATA);
  if (typeof legacy.notes === "string") migrated.openLoops = legacy.notes;
  if (typeof legacy.task === "string" && legacy.task.trim()) {
    migrated.priorities = [
      { id: createId(), text: legacy.task.trim(), done: false },
    ];
  }
  if (typeof legacy.review === "string")
    migrated.shutdown.sessionOutcome = legacy.review;
  if (typeof legacy.tomorrowNote === "string")
    migrated.shutdown.nextAction = legacy.tomorrowNote;
  if (Array.isArray(legacy.priorities))
    migrated.priorities = legacy.priorities.slice(0, 3);

  return normalizeData(migrated);
}

/**
 * @param {Record<string, unknown>} data
 */
function normalizeData(data) {
  const base = structuredClone(DEFAULT_DATA);
  const focus = /** @type {Record<string, unknown>} */ (
    data.focusSession || {}
  );
  const settings = /** @type {Record<string, unknown>} */ (data.settings || {});

  return {
    version: DATA_VERSION,
    priorities: Array.isArray(data.priorities)
      ? data.priorities
          .filter((priority) => priority && typeof priority.text === "string")
          .slice(0, 3)
          .map((priority) => ({
            id: typeof priority.id === "string" ? priority.id : createId(),
            text: priority.text.trim().slice(0, 80),
            done: Boolean(priority.done),
          }))
      : [],
    completedToday: Array.isArray(data.completedToday)
      ? data.completedToday.filter((item) => typeof item === "string")
      : [],
    dailyOutcome:
      typeof data.dailyOutcome === "string" ? data.dailyOutcome : "",
    openLoops:
      typeof data.openLoops === "string"
        ? data.openLoops
        : typeof data.notes === "string"
          ? data.notes
          : "",
    brainDump: typeof data.brainDump === "string" ? data.brainDump : "",
    primaryTaskId:
      typeof data.primaryTaskId === "string" ? data.primaryTaskId : null,
    widgetMode: data.widgetMode === "expanded" ? "expanded" : "compact",
    flowSessions: Array.isArray(data.flowSessions)
      ? data.flowSessions
          .filter((session) => session && typeof session === "object")
          .slice(-100)
          .map((session) => ({
            ...session,
            taskType: normalizeTaskType(session.taskType),
          }))
      : [],
    shutdown: {
      sessionOutcome:
        typeof data.shutdown?.sessionOutcome === "string"
          ? data.shutdown.sessionOutcome
          : typeof data.review === "string"
            ? data.review
            : "",
      disposition: data.shutdown?.disposition === "done" ? "done" : "continue",
      nextAction:
        typeof data.shutdown?.nextAction === "string"
          ? data.shutdown.nextAction
          : typeof data.tomorrowNote === "string"
            ? data.tomorrowNote
            : "",
      nextBlockAt:
        typeof data.shutdown?.nextBlockAt === "string"
          ? data.shutdown.nextBlockAt
          : "",
      complete: Boolean(data.shutdown?.complete),
    },
    onboardingSeen: {
      firstTask: Boolean(data.onboardingSeen?.firstTask),
      firstFocus: Boolean(data.onboardingSeen?.firstFocus),
      firstShutdown: Boolean(data.onboardingSeen?.firstShutdown),
    },
    focusSession: {
      status: normalizeSessionStatus(focus),
      phaseStartedAt:
        typeof focus.phaseStartedAt === "number"
          ? focus.phaseStartedAt
          : typeof focus.startedAt === "number"
            ? focus.startedAt
            : null,
      accumulatedSeconds:
        typeof focus.accumulatedSeconds === "number"
          ? focus.accumulatedSeconds
          : typeof focus.elapsedSeconds === "number"
            ? focus.elapsedSeconds
            : 0,
      plannedMinutes: clampNumber(focus.plannedMinutes, 15, 180, 50),
      recoveryMinutes: clampNumber(focus.recoveryMinutes, 1, 30, 8),
      objective: typeof focus.objective === "string" ? focus.objective : "",
      skill: clampNumber(focus.skill, 1, 5, 3),
      challenge: clampNumber(focus.challenge ?? focus.difficulty, 1, 5, 3),
      energy: clampNumber(focus.energy, 1, 5, 3),
      taskType: normalizeTaskType(focus.taskType),
      feedbackMetric:
        focus.feedbackMetric === "words" ||
        focus.feedbackMetric === "tests" ||
        focus.feedbackMetric === "items"
          ? focus.feedbackMetric
          : "milestone",
      interruptions: clampNumber(focus.interruptions, 0, 999, 0),
    },
    settings: {
      theme: settings.theme === "light" ? "light" : "dark",
      language: settings.language === "es" ? "es" : "en",
      reducedMotion:
        typeof settings.reducedMotion === "boolean"
          ? settings.reducedMotion
          : false,
      timeMode:
        settings.timeMode === "morning" ||
        settings.timeMode === "afternoon" ||
        settings.timeMode === "evening"
          ? settings.timeMode
          : settings.previewMode === "morning" ||
              settings.previewMode === "afternoon" ||
              settings.previewMode === "evening"
            ? settings.previewMode
            : "morning",
      deepWorkGuard: Boolean(settings.deepWorkGuard),
      tunnelVision: Boolean(settings.tunnelVision),
      blockedSites: Array.isArray(settings.blockedSites)
        ? settings.blockedSites
            .filter((s) => typeof s === "string")
            .slice(0, 20)
        : base.settings.blockedSites,
      blockedApps: Array.isArray(settings.blockedApps)
        ? settings.blockedApps.filter((s) => typeof s === "string").slice(0, 20)
        : [],
      helperEnabled: Boolean(settings.helperEnabled),
      displayName:
        typeof settings.displayName === "string"
          ? settings.displayName.trim().slice(0, 40)
          : "",
    },
  };
}

function clampNumber(value, min, max, fallback) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/** @param {unknown} value */
function normalizeTaskType(value) {
  const legacyMap = {
    admin: "shallow",
    creative: "deep",
    communication: "collab",
    learning: "learning",
    deep: "deep",
    shallow: "shallow",
    collab: "collab",
  };
  if (typeof value === "string" && legacyMap[value]) return legacyMap[value];
  return "deep";
}

function normalizeSessionStatus(focus) {
  const valid = [
    "idle",
    "preparing",
    "focusing",
    "paused",
    "recovery",
    "review",
  ];
  if (valid.includes(focus.status)) return focus.status;
  if (focus.phase === "break") return "recovery";
  if (focus.active) return "focusing";
  return focus.objective ? "preparing" : "idle";
}

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Flow channel score: ideal when challenge matches skill.
 * @param {number} skill 1-5
 * @param {number} challenge 1-5
 * @returns {"anxiety" | "flow" | "boredom"}
 */
export function getFlowChannel(skill, challenge) {
  const gap = Math.abs(skill - challenge);
  if (gap <= 1) return "flow";
  if (skill < challenge) return "anxiety";
  return "boredom";
}

/**
 * @param {Array<{ depth?: number; hour?: number; taskType?: string }>} sessions
 */
export function getFlowInsights(sessions) {
  if (!sessions.length) {
    return { bestHour: null, bestType: null, avgDepth: 0, completionRate: 0 };
  }

  const byHour = new Map();
  const byType = new Map();
  let depthSum = 0;
  let completed = 0;

  for (const session of sessions) {
    const hour = typeof session.hour === "number" ? session.hour : 0;
    const type = normalizeTaskType(session.taskType);
    const depth = typeof session.depth === "number" ? session.depth : 3;
    depthSum += depth;
    if (session.completed) completed += 1;
    const hourBucket = byHour.get(hour) || { total: 0, count: 0 };
    const typeBucket = byType.get(type) || { total: 0, count: 0 };
    byHour.set(hour, {
      total: hourBucket.total + depth,
      count: hourBucket.count + 1,
    });
    byType.set(type, {
      total: typeBucket.total + depth,
      count: typeBucket.count + 1,
    });
  }

  const rankQualified = (entries) =>
    entries
      .filter(([, bucket]) => bucket.count >= 3)
      .sort(
        (a, b) => b[1].total / b[1].count - a[1].total / a[1].count,
      )[0]?.[0] ?? null;

  const bestHour = rankQualified([...byHour.entries()]);
  const bestType = rankQualified([...byType.entries()]);

  return {
    bestHour,
    bestType,
    avgDepth: depthSum / sessions.length,
    completionRate: completed / sessions.length,
  };
}
