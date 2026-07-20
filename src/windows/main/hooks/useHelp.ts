import type { AppLocale, SessionStatus, TimeMode } from "../types/app";
import type { StudioTool } from "../components/ExpandedWidget";

/** Shape returned by Ask Aiba actions / help topics. */
export interface HelpResult {
  matched: boolean;
  answer: string;
  topicId: string | null;
  actions: Array<{
    type: string;
    tool?: StudioTool;
    phase?: TimeMode;
  }>;
  suggestions: string[];
  confidence: number;
}

// Types only — free-text ask was replaced by the FAQ accordion.
// resolveHelpQuery in shared/ still powers tests (and could come back later).

export type HelpContext = {
  timeMode: TimeMode;
  activeTool: StudioTool;
  sessionStatus: SessionStatus;
  locale: AppLocale;
};
