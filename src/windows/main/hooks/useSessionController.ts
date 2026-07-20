import { useCallback, useEffect } from "react";
import {
  createSessionRecord,
  getFocusElapsed,
  getRecoveryRemaining,
  transitionSession,
} from "../../../shared/session-machine.js";
import type { CopyShape } from "../../../shared/copy.js";
import type { AppData, FocusSession, GuardStatus, Priority } from "../types/app";

type SessionAction =
  | "prepare"
  | "start"
  | "pause"
  | "resume"
  | "finish"
  | "complete-recovery"
  | "skip-recovery"
  | "reset";

const ACTION_MAP = {
  prepare: "PREPARE",
  start: "START",
  pause: "PAUSE",
  resume: "RESUME",
  finish: "FINISH_FOCUS",
  "complete-recovery": "COMPLETE_RECOVERY",
  "skip-recovery": "SKIP_RECOVERY",
  reset: "RESET",
} as const;

interface UseSessionControllerOptions {
  data: AppData;
  now: Date;
  copy: CopyShape;
  primaryTask: Priority | null;
  update: (mutator: (draft: AppData) => void) => void;
  showToast: (message: string) => void;
  startEnvironment: () => Promise<void>;
  stopEnvironment: () => Promise<void>;
  collapse: () => Promise<void>;
  expand: () => Promise<void>;
}

export type { SessionAction };

export function useSessionController({
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
}: UseSessionControllerOptions) {
  const sessionStatus = data.focusSession.status;

  const handleSessionAction = useCallback(
    (action: SessionAction) => {
      const current = data.focusSession;
      let next = transitionSession(
        current,
        { type: ACTION_MAP[action] },
        Date.now(),
      ) as FocusSession;

      if (action === "start" && current.status === "idle" && current.objective.trim()) {
        const prepared = transitionSession(current, { type: "PREPARE" }, Date.now()) as FocusSession;
        next = transitionSession(prepared, { type: "START" }, Date.now()) as FocusSession;
      }

      update((draft) => {
        draft.focusSession = next;
        if (action === "start" && !draft.onboardingSeen.firstFocus) {
          draft.onboardingSeen.firstFocus = true;
        }
      });

      if (action === "start") {
        void startEnvironment();
        void collapse();
      }
      if (
        action === "finish" ||
        action === "complete-recovery" ||
        action === "skip-recovery" ||
        action === "reset"
      ) {
        void stopEnvironment();
      }
    },
    [collapse, data.focusSession, startEnvironment, stopEnvironment, update],
  );

  // Auto-finish when timer elapses
  useEffect(() => {
    if (sessionStatus === "focusing") {
      const elapsed = getFocusElapsed(data.focusSession, now.getTime());
      if (elapsed >= data.focusSession.plannedMinutes * 60) {
        handleSessionAction("finish");
        window.api?.showNotification(copy.appName, copy.eventMessages.sessionFinished);
        showToast(copy.eventMessages.sessionFinished);
      }
    }
    if (
      sessionStatus === "recovery" &&
      getRecoveryRemaining(data.focusSession, now.getTime()) === 0
    ) {
      handleSessionAction("complete-recovery");
    }
  }, [copy.eventMessages.sessionFinished, data.focusSession, handleSessionAction, now, sessionStatus, showToast]);

  // Auto-expand on review
  useEffect(() => {
    if (sessionStatus === "review" && data.widgetMode === "compact") {
      void expand();
    }
  }, [expand, sessionStatus, data.widgetMode]);

  const completeReview = useCallback(
    (review: { depth: number; nextAction?: string }, options?: { goToUnwind?: boolean }) => {
      const record = createSessionRecord(
        data.focusSession,
        { depth: review.depth, disposition: "done", nextAction: review.nextAction ?? "" },
        Date.now(),
      );
      update((draft) => {
        draft.flowSessions.push(record);
        draft.flowSessions = draft.flowSessions.slice(-100);
        if (draft.primaryTaskId) {
          const task = draft.priorities.find((p) => p.id === draft.primaryTaskId);
          if (task) task.done = true;
        }
        draft.focusSession = transitionSession(
          draft.focusSession,
          { type: "RESET" },
          Date.now(),
        );
        draft.settings.timeMode = options?.goToUnwind ? "evening" : "morning";
      });
      void stopEnvironment();
      showToast(copy.eventMessages.reviewSaved);
    },
    [copy.eventMessages.reviewSaved, data.focusSession, showToast, stopEnvironment, update],
  );

  const setSessionField = useCallback(
    <K extends keyof FocusSession>(field: K, value: FocusSession[K]) => {
      update((draft) => {
        draft.focusSession[field] = value;
        if (
          field === "objective" &&
          draft.focusSession.status === "idle" &&
          String(value).trim()
        ) {
          draft.focusSession.status = "preparing";
        }
      });
    },
    [update],
  );

  const selectTaskForFocus = useCallback(
    (task: Priority) => {
      update((draft) => {
        draft.primaryTaskId = task.id;
        draft.settings.timeMode = "afternoon";
        let next = { ...draft.focusSession, objective: task.text };
        if (next.status === "idle") {
          next = transitionSession(next, { type: "PREPARE" }, Date.now()) as FocusSession;
        } else if (next.status === "preparing") {
          next.objective = task.text;
        }
        draft.focusSession = next;
      });
    },
    [update],
  );

  const startFocusBridge = useCallback(() => {
    update((draft) => {
      if (draft.focusSession.status === "idle") {
        draft.focusSession.status = "preparing";
        if (!draft.focusSession.objective.trim()) {
          draft.focusSession.objective =
            draft.dailyOutcome.trim() || primaryTask?.text || "";
        }
      }
    });
  }, [primaryTask?.text, update]);

  return {
    handleSessionAction,
    completeReview,
    setSessionField,
    selectTaskForFocus,
    startFocusBridge,
  };
}
