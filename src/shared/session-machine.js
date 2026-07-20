import { getBreakMinutes } from "./break-rules.js";
import { DEFAULT_FOCUS_SESSION, createId } from "./data-schema.js";

export const SESSION_STATUS = {
  IDLE: "idle",
  PREPARING: "preparing",
  FOCUSING: "focusing",
  PAUSED: "paused",
  RECOVERY: "recovery",
  REVIEW: "review",
};

export function getFocusElapsed(session, now = Date.now()) {
  const accumulated = Math.max(0, session.accumulatedSeconds || 0);
  if (session.status !== SESSION_STATUS.FOCUSING || !session.phaseStartedAt) {
    return accumulated;
  }
  return accumulated + Math.max(0, Math.floor((now - session.phaseStartedAt) / 1000));
}

export function getRecoveryElapsed(session, now = Date.now()) {
  if (session.status !== SESSION_STATUS.RECOVERY || !session.phaseStartedAt) return 0;
  return Math.max(0, Math.floor((now - session.phaseStartedAt) / 1000));
}

export function getRecoveryRemaining(session, now = Date.now()) {
  const total = Math.max(1, session.recoveryMinutes || 1) * 60;
  return Math.max(0, total - getRecoveryElapsed(session, now));
}

export function transitionSession(session, action, now = Date.now()) {
  const next = structuredClone(session);

  switch (action.type) {
    case "PREPARE":
      next.status = SESSION_STATUS.PREPARING;
      if (typeof action.objective === "string") next.objective = action.objective;
      return next;
    case "START":
      if (!next.objective.trim()) return next;
      next.status = SESSION_STATUS.FOCUSING;
      next.phaseStartedAt = now;
      return next;
    case "PAUSE":
      if (next.status !== SESSION_STATUS.FOCUSING) return next;
      next.accumulatedSeconds = getFocusElapsed(next, now);
      next.phaseStartedAt = null;
      next.status = SESSION_STATUS.PAUSED;
      return next;
    case "RESUME":
      if (next.status !== SESSION_STATUS.PAUSED) return next;
      next.phaseStartedAt = now;
      next.status = SESSION_STATUS.FOCUSING;
      return next;
    case "FINISH_FOCUS": {
      if (
        next.status !== SESSION_STATUS.FOCUSING &&
        next.status !== SESSION_STATUS.PAUSED
      ) {
        return next;
      }
      next.accumulatedSeconds = getFocusElapsed(next, now);
      next.recoveryMinutes = getBreakMinutes(next.accumulatedSeconds / 60);
      next.phaseStartedAt = now;
      next.status = SESSION_STATUS.RECOVERY;
      return next;
    }
    case "COMPLETE_RECOVERY":
      if (next.status !== SESSION_STATUS.RECOVERY) return next;
      next.phaseStartedAt = null;
      next.status = SESSION_STATUS.REVIEW;
      return next;
    case "SKIP_RECOVERY":
      if (next.status !== SESSION_STATUS.RECOVERY) return next;
      next.phaseStartedAt = null;
      next.status = SESSION_STATUS.REVIEW;
      return next;
    case "RESET":
      return structuredClone(DEFAULT_FOCUS_SESSION);
    default:
      return next;
  }
}

export function createSessionRecord(session, review, now = Date.now()) {
  const actualMinutes = Math.max(1, Math.round(getFocusElapsed(session, now) / 60));
  return {
    id: createId(),
    task: session.objective || "Focus block",
    taskType: session.taskType,
    hour: new Date(now).getHours(),
    plannedMinutes: session.plannedMinutes,
    actualMinutes,
    skill: session.skill,
    challenge: session.challenge,
    energy: session.energy,
    depth: Math.min(5, Math.max(1, Number(review.depth) || 3)),
    interruptions: session.interruptions,
    completed: review.disposition === "done",
    nextAction: review.nextAction || "",
    endedAt: now,
  };
}
