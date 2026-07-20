import type { FlowSession, FocusSession } from "../windows/main/types/app";

export const SESSION_STATUS: {
  IDLE: "idle";
  PREPARING: "preparing";
  FOCUSING: "focusing";
  PAUSED: "paused";
  RECOVERY: "recovery";
  REVIEW: "review";
};

export type SessionAction =
  | { type: "PREPARE"; objective?: string }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "FINISH_FOCUS" }
  | { type: "COMPLETE_RECOVERY" }
  | { type: "SKIP_RECOVERY" }
  | { type: "RESET" };

export function getFocusElapsed(session: FocusSession, now?: number): number;
export function getRecoveryElapsed(session: FocusSession, now?: number): number;
export function getRecoveryRemaining(session: FocusSession, now?: number): number;
export function transitionSession(
  session: FocusSession,
  action: SessionAction,
  now?: number,
): FocusSession;
export function createSessionRecord(
  session: FocusSession,
  review: {
    depth: number;
    disposition: "done" | "continue";
    nextAction: string;
  },
  now?: number,
): FlowSession;
