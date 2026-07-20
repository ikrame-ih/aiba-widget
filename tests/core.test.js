import { describe, expect, it } from "vitest";
import { getPhaseCopy, getMessage, getCopy } from "../src/shared/copy.js";
import {
  DEFAULT_DATA,
  getFlowChannel,
  getFlowInsights,
  migrateData,
} from "../src/shared/data-schema.js";
import { resolveHelpQuery, normalizeQuery } from "../src/shared/help-resolver.js";
import { FAQ_TOPIC_IDS, getHelpTopicById } from "../src/shared/help-knowledge.js";
import {
  getFocusElapsed,
  transitionSession,
} from "../src/shared/session-machine.js";
import bounds from "../electron/services/window-bounds.js";
import guardUtils from "../electron/services/guard-utils.js";

describe("circadian copy and phases", () => {
  it("exposes phase action labels for each mode", () => {
    expect(getPhaseCopy("morning").action).toBe("Plan");
    expect(getPhaseCopy("afternoon").action).toBe("Focus");
    expect(getPhaseCopy("evening").action).toBe("Unwind");
  });

  it("returns Spanish copy when locale is es", () => {
    expect(getPhaseCopy("morning", "es").action).toBe("Plan");
    expect(getCopy("es").expand).toBe("Expandir");
  });
});

describe("schema migration", () => {
  it("moves legacy notes into open loops without losing the task", () => {
    const migrated = migrateData({
      notes: "Remember the citation",
      task: "Ship redesign",
    });
    expect(migrated.openLoops).toBe("Remember the citation");
    expect(migrated.priorities[0].text).toBe("Ship redesign");
    expect(migrated.version).toBe(8);
    expect(migrated.onboardingSeen.firstTask).toBe(false);
    expect(migrated.settings.theme).toBe("dark");
  });

  it("migrates v5 data and preserves quick notes + theme default", () => {
    const migrated = migrateData({
      version: 5,
      openLoops: "Plan note",
      brainDump: "Dump note",
      focusSession: DEFAULT_DATA.focusSession,
    });
    expect(migrated.version).toBe(8);
    expect(migrated.openLoops).toBe("Plan note");
    expect(migrated.brainDump).toBe("Dump note");
    expect(migrated.settings.theme).toBe("dark");
    expect(migrated.settings.language).toBe("en");
  });

  it("migrates an active v3 timer to the focusing state", () => {
    const migrated = migrateData({
      version: 3,
      notes: "open loop",
      focusSession: {
        active: true,
        startedAt: 10_000,
        elapsedSeconds: 90,
        plannedMinutes: 50,
        difficulty: 4,
        energy: 2,
      },
    });
    expect(migrated.version).toBe(8);
    expect(migrated.focusSession.status).toBe("focusing");
    expect(migrated.focusSession.challenge).toBe(4);
    expect(migrated.focusSession.accumulatedSeconds).toBe(90);
  });

  it("migrates previewMode to manual timeMode", () => {
    const migrated = migrateData({
      version: 7,
      settings: { previewMode: "evening" },
      focusSession: DEFAULT_DATA.focusSession,
    });
    expect(migrated.settings.timeMode).toBe("evening");
    expect(migrated.version).toBe(8);
  });

  it("falls back to a complete fresh schema", () => {
    expect(migrateData(null)).toEqual(DEFAULT_DATA);
  });
});

describe("dark theme defaults", () => {
  it("ships with dark theme and gold accent token", () => {
    expect(DEFAULT_DATA.settings.theme).toBe("dark");
    expect(DEFAULT_DATA.version).toBe(8);
    expect(DEFAULT_DATA.settings.timeMode).toBe("morning");
  });

  it("preserves light theme when explicitly set", () => {
    const migrated = migrateData({
      version: 6,
      settings: { theme: "light" },
      focusSession: DEFAULT_DATA.focusSession,
    });
    expect(migrated.settings.theme).toBe("light");
  });
});

describe("ask aiba resolver", () => {
  it("normalizes accented queries", () => {
    expect(normalizeQuery("¿Cómo inicio enfoque?")).toBe("como inicio enfoque");
  });

  it("matches focus questions in English", () => {
    const result = resolveHelpQuery("How do I start focus?", {
      timeMode: "morning",
      activeTool: "today",
      sessionStatus: "idle",
    });
    expect(result.topicId).toBe("afternoon-focus");
    expect(result.answer.toLowerCase()).toContain("focus");
  });

  it("matches Spanish quick notes intent", () => {
    const result = resolveHelpQuery("Que son las notas rapidas", {
      timeMode: "afternoon",
      activeTool: "notes",
    });
    expect(result.topicId).toBe("quick-notes");
  });

  it("uses app locale for suggested questions", () => {
    const english = resolveHelpQuery("", {
      timeMode: "morning",
      locale: "en",
    });
    expect(english.suggestions[0]).toBe("How do I start focus?");

    const spanish = resolveHelpQuery("", {
      timeMode: "morning",
      locale: "es",
    });
    expect(spanish.suggestions[0]).toBe("¿Cómo inicio enfoque?");
  });

  it("returns safe fallback with suggestions when confidence is low", () => {
    const result = resolveHelpQuery("xyzzy plugh abcd", {
      timeMode: "afternoon",
    });
    expect(result.matched).toBe(false);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.answer).toContain("planning");
  });

  it("exposes patterns in FAQ topics", () => {
    expect(FAQ_TOPIC_IDS).toContain("patterns");
    expect(getHelpTopicById("patterns", "en")?.answer).toMatch(/three/i);
    expect(getHelpTopicById("patterns", "es")?.answer).toMatch(/tres/i);
  });
});

describe("session state machine", () => {
  it("prepare leaves session in preparing without starting timer", () => {
    let session = structuredClone(DEFAULT_DATA.focusSession);
    session.objective = "Write draft";
    session = transitionSession(session, { type: "PREPARE" }, 1_000);
    expect(session.status).toBe("preparing");
    expect(getFocusElapsed(session, 5_000)).toBe(0);
  });

  it("keeps pause, resume, finish, and reset distinct", () => {
    let session = structuredClone(DEFAULT_DATA.focusSession);
    session.objective = "Draft the proposal";
    session = transitionSession(session, { type: "START" }, 1_000);
    expect(getFocusElapsed(session, 61_000)).toBe(60);

    session = transitionSession(session, { type: "PAUSE" }, 61_000);
    expect(session.status).toBe("paused");
    expect(getFocusElapsed(session, 121_000)).toBe(60);

    session = transitionSession(session, { type: "RESUME" }, 121_000);
    session = transitionSession(session, { type: "FINISH_FOCUS" }, 181_000);
    expect(session.status).toBe("recovery");
    expect(session.accumulatedSeconds).toBe(120);

    session = transitionSession(session, { type: "COMPLETE_RECOVERY" }, 182_000);
    expect(session.status).toBe("review");
    session = transitionSession(session, { type: "RESET" }, 183_000);
    expect(session).toEqual(DEFAULT_DATA.focusSession);
  });

  it("restores elapsed focus from a persisted timestamp", () => {
    const restored = {
      ...structuredClone(DEFAULT_DATA.focusSession),
      status: "focusing",
      phaseStartedAt: 10_000,
      accumulatedSeconds: 30,
    };
    expect(getFocusElapsed(restored, 55_000)).toBe(75);
  });
});

describe("flow evidence", () => {
  it("compares skill with challenge", () => {
    expect(getFlowChannel(3, 3)).toBe("flow");
    expect(getFlowChannel(2, 4)).toBe("anxiety");
    expect(getFlowChannel(5, 2)).toBe("boredom");
  });

  it("withholds pattern claims until a bucket has three samples", () => {
    const sparse = getFlowInsights([
      { hour: 9, taskType: "deep", depth: 5, completed: true },
      { hour: 14, taskType: "shallow", depth: 2, completed: false },
    ]);
    expect(sparse.bestHour).toBeNull();
    expect(sparse.bestType).toBeNull();

    const qualified = getFlowInsights([
      { hour: 9, taskType: "deep", depth: 4, completed: true },
      { hour: 9, taskType: "deep", depth: 5, completed: true },
      { hour: 9, taskType: "deep", depth: 3, completed: false },
    ]);
    expect(qualified.bestHour).toBe(9);
    expect(qualified.bestType).toBe("deep");
    expect(qualified.completionRate).toBeCloseTo(2 / 3);
  });
});

describe("native bounds", () => {
  it("keeps the right edge fixed while expanding on a negative-coordinate display", () => {
    const next = bounds.calculateModeBounds(
      { x: -400, y: 120, width: 360, height: 260 },
      { width: 740, height: 720 },
      { x: -1920, y: 0, width: 1920, height: 1040 },
    );
    expect(next).toEqual({ x: -780, y: 120, width: 740, height: 720 });
  });
});

describe("guard safety", () => {
  it("rejects host-file injection and deduplicates domains", () => {
    expect(
      guardUtils.sanitizeSites([
        "www.youtube.com",
        "youtube.com",
        "bad.test\n127.0.0.1 example.com",
        "https://x.com",
      ]),
    ).toEqual(["youtube.com"]);
  });

  it("removes only Aiba's marked hosts block", () => {
    const original = "127.0.0.1 local.dev\n";
    const guarded = `${original}# AIBA-GUARD-START\n0.0.0.0 youtube.com\n# AIBA-GUARD-END\n`;
    expect(guardUtils.stripGuardBlock(guarded)).toBe(original.trimEnd());
  });
});
