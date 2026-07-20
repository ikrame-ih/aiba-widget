import { useCallback, useEffect, useMemo, useState } from "react";
import { CompactWidget } from "./components/CompactWidget";
import {
  ExpandedWidget,
  normalizeStudioTool,
  type StudioOverlay,
} from "./components/ExpandedWidget";
import { useCopy } from "./context/CopyContext";
import { useToast } from "./context/ToastContext";
import { useAppDataContext } from "./context/AppDataContext";
import { useAibaBehavior } from "./hooks/useAibaBehavior";
import { useEnvironment } from "./hooks/useEnvironment";
import { useSessionController } from "./hooks/useSessionController";
import type { WidgetMode } from "./types/app";

export function AppShell() {
  const copy = useCopy();
  const { showToast } = useToast();
  const {
    data,
    update,
    setTimeMode,
    setWidgetMode,
    addPriority,
    togglePriority,
    removePriority,
    updatePriority,
    setPrimaryTask,
    clearCompleted,
    primaryTask,
  } = useAppDataContext();

  const locale = data.settings.language;
  const timeMode = data.settings.timeMode ?? "morning";
  const [now, setNow] = useState(() => new Date());
  const [studioOverlay, setStudioOverlay] = useState<StudioOverlay>(null);
  const [transitioning, setTransitioning] = useState(false);

  const widgetMode: WidgetMode = data.widgetMode;
  const sessionStatus = data.focusSession.status;
  const isFocusing = sessionStatus === "focusing";

  const { behavior, isSleeping } = useAibaBehavior({
    timeMode,
    sessionStatus,
  });

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Smoke tests start with an active focus session so the compact timer is visible.
  useEffect(() => {
    if (!window.api?.isSmokeTest) return;
    update((draft) => {
      if (
        draft.focusSession.status !== "focusing" &&
        draft.focusSession.status !== "paused"
      ) {
        draft.focusSession.status = "focusing";
        draft.focusSession.objective = "Smoke test focus block";
        draft.focusSession.phaseStartedAt = Date.now();
        draft.focusSession.plannedMinutes = 25;
      }
    });
  }, [update]);

  const {
    guardStatus,
    setGuardStatus,
    startEnvironment,
    stopEnvironment,
    handleTunnelVision,
    handleGuard,
  } = useEnvironment({ data, update, isFocusing });

  const expand = useCallback(async () => {
    if (widgetMode === "expanded") return;
    setTransitioning(true);
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    await setWidgetMode("expanded");
    setTransitioning(false);
  }, [setWidgetMode, widgetMode]);

  const collapse = useCallback(async () => {
    if (widgetMode === "compact") return;
    setStudioOverlay(null);
    setTransitioning(true);
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    await setWidgetMode("compact");
    setTransitioning(false);
  }, [setWidgetMode, widgetMode]);

  // If we're already expanded, just change phase/tool — don't remount the window.
  const stayOrExpand = useCallback(async () => {
    if (widgetMode === "expanded") return;
    await expand();
  }, [expand, widgetMode]);

  const {
    handleSessionAction,
    completeReview,
    setSessionField,
    selectTaskForFocus,
    startFocusBridge,
  } = useSessionController({
    data,
    now,
    copy,
    primaryTask,
    update,
    showToast,
    startEnvironment,
    stopEnvironment,
    collapse,
    expand,
  });

  const contextualHint = useMemo(() => {
    if (
      data.onboardingSeen.firstTask &&
      data.onboardingSeen.firstFocus &&
      data.onboardingSeen.firstShutdown
    ) {
      return null;
    }
    if (!data.onboardingSeen.firstTask && data.priorities.length === 0) {
      return copy.eventMessages.firstTask;
    }
    if (
      !data.onboardingSeen.firstFocus &&
      data.focusSession.status === "idle" &&
      data.priorities.length > 0
    ) {
      return copy.eventMessages.firstFocus;
    }
    if (
      !data.onboardingSeen.firstShutdown &&
      timeMode === "evening" &&
      !data.shutdown.complete
    ) {
      return copy.eventMessages.firstShutdown;
    }
    return null;
  }, [copy.eventMessages, data, timeMode]);

  const dismissHint = useCallback(() => {
    update((draft) => {
      if (!draft.onboardingSeen.firstTask && draft.priorities.length === 0) {
        draft.onboardingSeen.firstTask = true;
      } else if (!draft.onboardingSeen.firstFocus) {
        draft.onboardingSeen.firstFocus = true;
      } else if (!draft.onboardingSeen.firstShutdown) {
        draft.onboardingSeen.firstShutdown = true;
      }
    });
  }, [update]);

  const handleHelpAction = useCallback(
    (action: { type: string; tool?: string; phase?: string }) => {
      if (action.type === "switch-phase" && action.phase) {
        const phase = action.phase;
        if (
          phase === "morning" ||
          phase === "afternoon" ||
          phase === "evening"
        ) {
          setStudioOverlay(null);
          update((draft) => {
            draft.settings.timeMode = phase;
          });
          void stayOrExpand();
        }
        return;
      }
      if (action.type === "switch-tool" && action.tool) {
        const tool = normalizeStudioTool(action.tool);
        if (tool === "preferences") {
          setStudioOverlay("preferences");
          void stayOrExpand();
          return;
        }

        setStudioOverlay(null);
        // Sessions / notes both live inside Plan
        if (tool === "today" || tool === "sessions" || tool === "notes") {
          update((draft) => {
            draft.settings.timeMode = "morning";
          });
        }
        void stayOrExpand();

        if (tool === "sessions") {
          window.setTimeout(() => {
            document
              .querySelector('[data-studio-section="history"]')
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        }
        return;
      }
      if (action.type === "start-focus") {
        update((draft) => {
          draft.settings.timeMode = "afternoon";
        });
        startFocusBridge();
        setStudioOverlay(null);
        void stayOrExpand();
        return;
      }
      if (action.type === "expand") void expand();
      if (action.type === "collapse") void collapse();
      if (action.type === "open-help") window.api?.openHelpWindow(locale);
    },
    [collapse, expand, locale, startFocusBridge, stayOrExpand, update],
  );

  useEffect(() => {
    const stop = window.api?.onShortcut(({ action }) => {
      if (action === "toggle-session") {
        if (sessionStatus === "focusing") handleSessionAction("pause");
        else if (sessionStatus === "paused") handleSessionAction("resume");
        else if (
          sessionStatus === "preparing" &&
          data.focusSession.objective.trim()
        ) {
          handleSessionAction("start");
        } else {
          setStudioOverlay(null);
          void stayOrExpand();
        }
      }
    });
    return () => stop?.();
  }, [
    data.focusSession.objective,
    handleSessionAction,
    sessionStatus,
    stayOrExpand,
  ]);

  const openPreferences = useCallback(async () => {
    setStudioOverlay("preferences");
    await stayOrExpand();
  }, [stayOrExpand]);

  return (
    <div
      className={`app-shell ${transitioning ? "is-transitioning" : ""} ${data.settings.reducedMotion ? "is-reduced-motion" : ""}`}
      data-theme={data.settings.theme}
      lang={locale}
    >
      <div className="drag-rail drag-rail--top" aria-hidden="true" />
      <div className="drag-rail drag-rail--right" aria-hidden="true" />
      <div className="drag-rail drag-rail--bottom" aria-hidden="true" />
      <div className="drag-rail drag-rail--left" aria-hidden="true" />
      {widgetMode === "compact" ? (
        <CompactWidget
          now={now}
          data={data}
          onExpand={expand}
          onOpenPreferences={openPreferences}
          onSessionAction={handleSessionAction}
        />
      ) : (
        <ExpandedWidget
          timeMode={timeMode}
          now={now}
          data={data}
          guardStatus={guardStatus}
          studioOverlay={studioOverlay}
          behavior={behavior}
          sleeping={isSleeping}
          onTimeMode={setTimeMode}
          onStudioOverlay={setStudioOverlay}
          onCollapse={collapse}
          onSelectTaskForFocus={selectTaskForFocus}
          onUpdate={update}
          onAddPriority={addPriority}
          onTogglePriority={togglePriority}
          onRemovePriority={removePriority}
          onUpdatePriority={updatePriority}
          onPrimary={setPrimaryTask}
          onClearCompleted={clearCompleted}
          onSessionField={setSessionField}
          onSessionAction={handleSessionAction}
          onCompleteReview={completeReview}
          onTunnelVision={handleTunnelVision}
          onGuard={handleGuard}
          onGuardStatus={setGuardStatus}
          contextualHint={contextualHint}
          onDismissHint={dismissHint}
          onAskAction={handleHelpAction}
        />
      )}
    </div>
  );
}
