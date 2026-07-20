import type { TimeMode } from "../windows/main/types/app";

export type AppLocale = "en" | "es";

export interface PhaseCopy {
  title: string;
  action: string;
  phaseLabel: string;
  tagline: string;
  kanji: string;
}

export interface CopyShape {
  appName: string;
  phases: Record<TimeMode, PhaseCopy>;
  messages: Record<string, string[]>;
  eventMessages: Record<string, string>;
  preview: string;
  expand: string;
  minimize: string;
  hideWidget: string;
  loading: string;
  sessionDone: string;
  singleTask: string;
  flowCheck: string;
  recovery: string;
  askAiba: string;
  askNoMatch: string;
  gotIt: string;
  aria: {
    phaseNav: string;
    focusCycle: string;
    reducedMotion: string;
    tunnelVision: string;
    deepWorkGuard: string;
    blockSites: string;
  };
  taskTypes: Record<string, string>;
  nav: {
    today: string;
    notes: string;
    sessions: string;
    preferences: string;
  };
  navDescriptions: {
    today: string;
    notes: string;
    sessions: string;
    preferences: string;
  };
  settingsGroups: {
    profile: string;
    appearance: string;
    focus: string;
    sites: string;
    links: string;
  };
  settingDescriptions: {
    displayName: string;
    appearance: string;
    language: string;
    reducedMotion: string;
    tunnelVision: string;
    deepWorkGuard: string;
    blockSites: string;
    domains: string;
    openWindowsFocus: string;
    openFocusGuide: string;
  };
  empty: {
    priorities: string;
    sessionsNone: string;
    sessionsEarly: string;
    notes: string;
    shutdown: string;
  };
  actions: {
    startFocus: string;
    planToday: string;
    wrapUp: string;
    takeBreak: string;
    fineTune: string;
    openStudio: string;
    saveSession: string;
    completeShutdown: string;
    begin: string;
    pause: string;
    resume: string;
    finish: string;
    confirmFinish: string;
    skip: string;
    discard: string;
    recoveryComplete: string;
    openHelp: string;
    goThere: string;
    clearAsk: string;
    clearCompleted: string;
    saveTask: string;
    cancelEdit: string;
  };
  labels: {
    mainGoal: string;
    mainGoalHint: string;
    mainGoalPlaceholder: string;
    tasks: string;
    addTaskPlaceholder: string;
    newTask: string;
    editTask: string;
    deleteTask: string;
    applySiteBlock: string;
    removeSiteBlock: string;
    restoreDefaultSites: string;
    removeSiteBlockHint: string;
    siteBlockHint: string;
    displayName: string;
    displayNamePlaceholder: string;
    focusOutput: string;
    focusOutputPlaceholder: string;
    duration: string;
    unwindWentWell: string;
    unwindTomorrow: string;
    unwindTomorrowPlaceholder: string;
    heroTask: string;
    tasksRemaining: (n: number) => string;
    timeLeft: (m: number) => string;
    skill: string;
    challenge: string;
    depth: string;
    language: string;
    appearance: string;
    themeDark: string;
    themeLight: string;
    reducedMotion: string;
    tunnelVision: string;
    deepWorkGuard: string;
    blockSites: string;
    domains: string;
    domainsPlaceholder: string;
    openWindowsFocus: string;
    openFocusGuide: string;
    sessionDisposition: string;
    done: string;
    continueLater: string;
    nextAction: string;
    bestFocusHour: string;
    bestTaskType: string;
    averageDepth: string;
    completionRate: string;
    sessionMinutes: (n: number) => string;
  };
  language: {
    en: string;
    es: string;
  };
  compact: {
    focusing: string;
    paused: string;
    recovery: string;
    ready: string;
    currentPath: string;
    versionLabel: string;
    preferences: string;
  };
  focusPrep: {
    title: string;
    emptyLead: string;
    directLead: string;
    goToPlan: string;
    selectedTask: string;
    changeTask: string;
    duration: string;
    durationMin: (n: number) => string;
    taskType: string;
    taskTypeHint: string;
    environment: string;
    preferencesLink: string;
  };
  review: {
    title: string;
    hint: string;
    quality: {
      distracted: string;
      shallow: string;
      normal: string;
      deep: string;
    };
    save: string;
    goUnwind: string;
    nextActionPlaceholder: string;
  };
  plan: {
    tomorrowPrompt: (step: string) => string;
    addTomorrowStep: string;
    dismissTomorrow: string;
    tomorrowHint: string;
  };
  patterns: {
    bestHourEmpty: string;
    bestTypeEmpty: string;
  };
  focus: {
    completed: string;
    completedDuring: (duration: string) => string;
    currentFocus: string;
    upNext: string;
    pending: string;
    skillLow: string;
    skillMedium: string;
    skillHigh: string;
    current: string;
    markComplete: (task: string) => string;
    historyLine: (
      time: string,
      task: string,
      skill: string,
      challenge: string,
      isCurrent: boolean,
    ) => string;
    flowAligned: string;
    flowAnxiety: string;
    flowBoredom: string;
    recoveryHint: string;
  };
  ask: {
    intro: string;
    faqs: Array<{ id: string; question: string }>;
    openTool: (label: string) => string;
    openHelp: string;
  };
  doneToday: string;
  unwind: {
    sessionsToday: string;
    focusMinutes: string;
    tasksCompleted: string;
  };
  studio: {
    title: string;
    coreIntent: string;
    atelier: string;
    viewAll: string;
    backToPlan: string;
    backToPhase: string;
    helloFallback: string;
    helloUser: (name: string) => string;
    phaseHeader: Record<TimeMode, string>;
    todayLead: string;
    todayPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    focusLead: string;
    unwindLead: string;
    focusTagline: string;
    restTagline: string;
    eveningHeadline: string;
    sections: {
      today: { jp: string; label: string };
      notes: { jp: string; label: string };
      tasks: { jp: string; label: string };
      history: { jp: string; label: string };
      wentWell: { jp: string; label: string };
      tomorrow: { jp: string; label: string };
    };
  };
  toast: {
    siteBlockApplied: string;
    siteBlockRemoved: string;
    defaultSitesRestored: string;
    reducedMotionOn: string;
    reducedMotionOff: string;
    tunnelVisionOn: string;
    tunnelVisionOff: string;
    deepWorkGuardOn: string;
    deepWorkGuardOff: string;
    blockSitesOn: string;
    blockSitesOff: string;
    themeDark: string;
    themeLight: string;
  };
  guard: {
    active: string;
    cleanup: string;
    blockerFailed: string;
    sitesBlocked: string;
    helperRunning: string;
  };
}

export const copy: CopyShape;

export function resolveLocale(value: unknown): AppLocale;
export function getCopy(locale?: AppLocale | unknown): CopyShape;
export function getMessage(mode: TimeMode | string, index?: number, locale?: AppLocale | unknown): string;
export function getPhaseCopy(mode: TimeMode, locale?: AppLocale | unknown): PhaseCopy;
