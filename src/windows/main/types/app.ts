export type TimeMode = "morning" | "afternoon" | "evening";
export type WidgetMode = "compact" | "expanded";
export type TimerPhase = "focus" | "break";
export type SessionStatus =
  | "idle"
  | "preparing"
  | "focusing"
  | "paused"
  | "recovery"
  | "review";
export type TaskType = "deep" | "shallow" | "learning" | "collab";
export type AppTheme = "dark" | "light";
export type AppLocale = "en" | "es";
export type AibaMood = "bright" | "focused" | "drowsy";

export interface Priority {
  id: string;
  text: string;
  done: boolean;
}

export interface FlowSession {
  id: string;
  task: string;
  taskType: TaskType;
  hour: number;
  plannedMinutes: number;
  actualMinutes: number;
  energy: number;
  skill: number;
  challenge: number;
  depth: number;
  interruptions: number;
  completed: boolean;
  nextAction: string;
  endedAt: number;
}

export interface FocusSession {
  status: SessionStatus;
  phaseStartedAt: number | null;
  accumulatedSeconds: number;
  plannedMinutes: number;
  recoveryMinutes: number;
  objective: string;
  skill: number;
  challenge: number;
  energy: number;
  taskType: TaskType;
  feedbackMetric: "milestone" | "words" | "tests" | "items";
  interruptions: number;
}

export interface AppSettings {
  theme: AppTheme;
  language: AppLocale;
  reducedMotion: boolean;
  timeMode: TimeMode;
  deepWorkGuard: boolean;
  tunnelVision: boolean;
  blockedSites: string[];
  blockedApps: string[];
  helperEnabled: boolean;
  displayName: string;
}

export interface OnboardingSeen {
  firstTask: boolean;
  firstFocus: boolean;
  firstShutdown: boolean;
}

export interface AppData {
  version: number;
  priorities: Priority[];
  completedToday: string[];
  dailyOutcome: string;
  openLoops: string;
  brainDump: string;
  primaryTaskId: string | null;
  widgetMode: WidgetMode;
  flowSessions: FlowSession[];
  onboardingSeen: OnboardingSeen;
  shutdown: {
    sessionOutcome: string;
    disposition: "done" | "continue";
    nextAction: string;
    nextBlockAt: string;
    complete: boolean;
  };
  focusSession: FocusSession;
  settings: AppSettings;
}

export interface GuardStatus {
  active: boolean;
  helperRunning: boolean;
  notificationsMuted: boolean;
  sitesBlocked: boolean;
  message: string;
}

export interface WidgetModeResult {
  mode: WidgetMode;
  bounds: { x: number; y: number; width: number; height: number } | null;
}

export interface ElectronApi {
  initialWidgetMode: WidgetModeResult;
  isSmokeTest?: boolean;
  loadData: () => Promise<unknown>;
  saveData: (data: AppData) => Promise<boolean>;
  openHelpWindow: (locale?: AppLocale) => void;
  closeWindow: () => void;
  setWidgetMode: (mode: WidgetMode) => Promise<WidgetModeResult>;
  getWidgetMode: () => Promise<WidgetModeResult>;
  onWidgetModeChanged: (
    callback: (payload: WidgetModeResult) => void,
  ) => () => void;
  setTunnelVision: (enabled: boolean) => Promise<boolean>;
  setFocusGuard: (payload: { enabled: boolean }) => Promise<GuardStatus>;
  applySiteBlock: (payload: { blockedSites: string[] }) => Promise<GuardStatus>;
  removeSiteBlock: () => Promise<GuardStatus>;
  getGuardStatus: () => Promise<GuardStatus>;
  openFocusAssist: () => Promise<boolean>;
  showNotification: (title: string, body?: string) => void;
  onShortcut: (callback: (payload: { action: string }) => void) => () => void;
}

declare global {
  interface Window {
    api?: ElectronApi;
  }
}

export {};
