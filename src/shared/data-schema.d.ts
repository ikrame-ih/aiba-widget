import type { AppData, FocusSession } from "../windows/main/types/app";

export const DATA_VERSION: number;
export const DEFAULT_BLOCKED_SITES: string[];
export const DEFAULT_FOCUS_SESSION: FocusSession;
export const DEFAULT_DATA: AppData;

export function createId(): string;
export function migrateData(input: unknown): AppData;
export function getFlowChannel(
  skill: number,
  challenge: number,
): "flow" | "anxiety" | "boredom";
export function getFlowInsights(sessions: AppData["flowSessions"]): {
  bestHour: number | null;
  bestType: string | null;
  avgDepth: number;
  completionRate: number;
};
