import { StudioSidebar } from "./StudioSidebar";
import { FocusPrepPanel, isFocusSessionActive } from "./FocusPrepPanel";
import { TodayStudioView } from "./TodayStudioView";
import { FocusPanel } from "./panels/FocusPanel";
import { PreferencesPanel } from "./panels/PreferencesPanel";
import { UnwindPanel } from "./panels/UnwindPanel";
import { StudioViewTransition } from "./StudioViewTransition";
import { useCopy } from "../context/CopyContext";
import type { AibaBehavior } from "../hooks/useAibaBehavior";
import { fmtTimeAmPm } from "../lib/time";
import type {
  AppData,
  FocusSession,
  GuardStatus,
  Priority,
  SessionStatus,
  TimeMode,
} from "../types/app";
import type { HelpResult } from "../hooks/useHelp";

export type StudioTool = "today" | "notes" | "sessions" | "preferences";

export type StudioOverlay = null | "preferences";

interface ExpandedWidgetProps {
  timeMode: TimeMode;
  now: Date;
  data: AppData;
  guardStatus: GuardStatus | null;
  studioOverlay: StudioOverlay;
  behavior: AibaBehavior;
  sleeping: boolean;
  onTimeMode: (mode: TimeMode) => void;
  onStudioOverlay: (overlay: StudioOverlay) => void;
  onCollapse: () => void;
  onSelectTaskForFocus: (task: Priority) => void;
  onUpdate: (mutator: (draft: AppData) => void) => void;
  onAddPriority: (text: string) => boolean;
  onTogglePriority: (id: string) => void;
  onRemovePriority: (id: string) => void;
  onUpdatePriority: (id: string, text: string) => boolean;
  onPrimary: (id: string) => void;
  onClearCompleted: () => void;
  onSessionField: <K extends keyof FocusSession>(
    field: K,
    value: FocusSession[K],
  ) => void;
  onSessionAction: Parameters<typeof FocusPanel>[0]["onAction"];
  onCompleteReview: Parameters<typeof FocusPanel>[0]["onCompleteReview"];
  onTunnelVision: (enabled: boolean) => void;
  onGuard: (enabled: boolean) => void;
  onGuardStatus: (status: GuardStatus) => void;
  contextualHint?: string | null;
  onDismissHint?: () => void;
  onAskAction: (action: HelpResult["actions"][number]) => void;
}

const LEGACY_TOOL_MAP: Record<string, StudioTool> = {
  now: "today",
  capture: "notes",
  history: "sessions",
  settings: "preferences",
};

export function normalizeStudioTool(tool: string): StudioTool {
  return (
    LEGACY_TOOL_MAP[tool] ??
    (["today", "notes", "sessions", "preferences"].includes(tool)
      ? (tool as StudioTool)
      : "today")
  );
}

function focusSessionActive(status: SessionStatus) {
  return isFocusSessionActive(status);
}

export function ExpandedWidget({
  timeMode,
  now,
  data,
  guardStatus,
  studioOverlay,
  behavior,
  sleeping,
  onTimeMode,
  onStudioOverlay,
  onCollapse,
  onSelectTaskForFocus,
  onUpdate,
  onAddPriority,
  onTogglePriority,
  onRemovePriority,
  onUpdatePriority,
  onPrimary,
  onClearCompleted,
  onSessionField,
  onSessionAction,
  onCompleteReview,
  onTunnelVision,
  onGuard,
  onGuardStatus,
  contextualHint,
  onDismissHint,
  onAskAction,
}: ExpandedWidgetProps) {
  const copy = useCopy();
  const phase = copy.phases[timeMode];
  const sessionStatus = data.focusSession.status;
  const sessionBusy =
    sessionStatus === "focusing" || sessionStatus === "paused";
  const mood =
    focusSessionActive(sessionStatus) || sessionBusy
      ? "focused"
      : timeMode === "evening"
        ? "drowsy"
        : timeMode === "morning"
          ? "bright"
          : "focused";
  const aibaSleeping =
    sleeping ||
    (timeMode === "evening" &&
      !focusSessionActive(sessionStatus) &&
      !sessionBusy);

  const viewKey =
    studioOverlay === "preferences"
      ? "preferences"
      : `${timeMode}-${sessionStatus}`;

  const handleTimeMode = (mode: TimeMode) => {
    onTimeMode(mode);
    onStudioOverlay(null);
  };

  const mainContent = (() => {
    if (studioOverlay === "preferences") {
      return (
        <div className="studio-overlay">
          <button
            type="button"
            className="studio-back-link"
            onClick={() => onStudioOverlay(null)}
          >
            ← {copy.studio.backToPhase}
          </button>
          <PreferencesPanel
            data={data}
            guardStatus={guardStatus}
            onUpdate={onUpdate}
            onTunnelVision={onTunnelVision}
            onGuard={onGuard}
            onGuardStatus={onGuardStatus}
          />
        </div>
      );
    }

    if (timeMode === "morning") {
      return (
        <>
          {contextualHint && (
            <div className="contextual-hint" data-exclude-roam>
              <p>{contextualHint}</p>
              <button
                type="button"
                className="btn-ghost"
                onClick={onDismissHint}
              >
                {copy.gotIt}
              </button>
            </div>
          )}
          <TodayStudioView
            priorities={data.priorities}
            dailyOutcome={data.dailyOutcome}
            openLoops={data.openLoops}
            flowSessions={data.flowSessions}
            shutdownNextAction={data.shutdown.nextAction}
            primaryTaskId={data.primaryTaskId}
            onAdd={onAddPriority}
            onToggle={onTogglePriority}
            onRemove={onRemovePriority}
            onUpdate={onUpdatePriority}
            onOutcome={(value) =>
              onUpdate((draft) => {
                draft.dailyOutcome = value;
              })
            }
            onPrimary={onPrimary}
            onOpenLoops={(value) =>
              onUpdate((draft) => {
                draft.openLoops = value;
              })
            }
            onSelectTaskForFocus={onSelectTaskForFocus}
            onClearCompleted={onClearCompleted}
          />
        </>
      );
    }

    if (timeMode === "afternoon") {
      if (focusSessionActive(sessionStatus)) {
        return (
          <FocusPanel
            focus={data.focusSession}
            now={now.getTime()}
            reducedMotion={data.settings.reducedMotion}
            onCollapse={onCollapse}
            onAction={onSessionAction}
            onCompleteReview={onCompleteReview}
          />
        );
      }

      return (
        <FocusPrepPanel
          data={data}
          onUpdate={onUpdate}
          onSessionField={onSessionField}
          onSessionAction={(action) => onSessionAction(action)}
          onTunnelVision={onTunnelVision}
          onGuard={onGuard}
          onOpenPreferences={() => onStudioOverlay("preferences")}
          onGoToPlan={() => handleTimeMode("morning")}
        />
      );
    }

    return (
      <UnwindPanel
        shutdown={data.shutdown}
        priorities={data.priorities}
        flowSessions={data.flowSessions}
        onField={(field, value) =>
          onUpdate((draft) => {
            draft.shutdown[field] = value as never;
          })
        }
      />
    );
  })();

  return (
    <main
      className="widget widget--expanded studio-layout"
      data-time-mode={timeMode}
      aria-label={copy.studio.title}
    >
      <div className="studio-window-controls">
        <button
          type="button"
          className="studio-window-controls__btn"
          aria-label={copy.minimize}
          title={copy.minimize}
          onClick={onCollapse}
        >
          −
        </button>
        <button
          type="button"
          className="studio-window-controls__btn"
          aria-label={copy.hideWidget}
          title={copy.hideWidget}
          onClick={() => window.api?.closeWindow()}
        >
          ×
        </button>
      </div>

      <div className="studio-shell">
        <StudioSidebar
          timeMode={timeMode}
          locale={data.settings.language}
          mood={mood}
          behavior={behavior}
          sleeping={aibaSleeping}
          reducedMotion={data.settings.reducedMotion}
          displayName={data.settings.displayName}
          onTimeMode={handleTimeMode}
          onCollapse={onCollapse}
          onOpenPreferences={() => onStudioOverlay("preferences")}
          onAskAction={onAskAction}
        />

        <section className="studio-main">
          <div className="studio-main__grain" aria-hidden="true" />
          <div className="studio-main__wash" aria-hidden="true" />

          <div className="studio-main__body">
            <header className="studio-main__header studio-main__header--drag studio-main__header--sticky">
              <div className="studio-main__titlebar">
                <div className="studio-main__header-meta">
                  <h1 className="studio-main__phase">
                    <span className="studio-main__kanji" aria-hidden="true">
                      {phase.kanji}
                    </span>
                    <span className="studio-main__phase-label">
                      {copy.studio.phaseHeader[timeMode]}
                    </span>
                  </h1>
                </div>
                <time
                  className="studio-main__time"
                  dateTime={now.toISOString()}
                >
                  {fmtTimeAmPm(now, data.settings.language)}
                </time>
              </div>
            </header>

            <div className="studio-main__content">
              <StudioViewTransition key={viewKey}>
                {mainContent}
              </StudioViewTransition>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
