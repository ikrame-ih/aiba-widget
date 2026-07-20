import { useState } from "react";
import { useCopy } from "../../context/CopyContext";
import {
  getFocusElapsed,
  getRecoveryRemaining,
} from "../../../../shared/session-machine.js";
import { EnsoProgress } from "../EnsoProgress";
import { fmtTimer } from "../../lib/time";
import type { FocusSession } from "../../types/app";

interface FocusPanelProps {
  focus: FocusSession;
  now: number;
  reducedMotion?: boolean;
  onCollapse?: () => void;
  onAction: (
    action:
      | "prepare"
      | "start"
      | "pause"
      | "resume"
      | "finish"
      | "complete-recovery"
      | "skip-recovery"
      | "reset",
  ) => void;
  onCompleteReview: (review: { depth: number; nextAction?: string }, options?: { goToUnwind?: boolean }) => void;
}

export function FocusPanel({
  focus,
  now,
  reducedMotion = false,
  onCollapse,
  onAction,
  onCompleteReview,
}: FocusPanelProps) {
  const copy = useCopy();
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const elapsed = getFocusElapsed(focus, now);
  const remaining = Math.max(0, focus.plannedMinutes * 60 - elapsed);
  const recoveryRemaining = getRecoveryRemaining(focus, now);
  const progress = Math.min(100, (elapsed / (focus.plannedMinutes * 60)) * 100);

  const handleFinish = () => {
    if (remaining > 300 && !confirmingFinish) {
      setConfirmingFinish(true);
      window.setTimeout(() => setConfirmingFinish(false), 3000);
      return;
    }
    setConfirmingFinish(false);
    onAction("finish");
  };

  return (
    <section className="panel focus-panel focus-panel--studio" aria-label={copy.aria.focusCycle}>
      {(focus.status === "focusing" || focus.status === "paused") && (
        <div className="focus-studio">
          <div className="focus-studio__header">
            <p className="focus-studio__kicker">
              <span className="focus-studio__kicker-kanji">一事</span>
              <span className="focus-studio__kicker-sep" aria-hidden="true">
                ·
              </span>
              <span className="focus-studio__kicker-text">{copy.studio.focusLead}</span>
            </p>
            <h2 className="focus-studio__title">{focus.objective}</h2>
          </div>
          <EnsoProgress
            progress={progress}
            label={fmtTimer(remaining)}
            reducedMotion={reducedMotion}
            variant="studio"
          />
          <div className="focus-studio__controls focus-studio__controls--active">
            <button
              type="button"
              className="studio-btn studio-btn--outline focus-studio__action"
              onClick={() => onAction(focus.status === "paused" ? "resume" : "pause")}
            >
              {focus.status === "paused" ? copy.actions.resume : copy.actions.pause}
            </button>
            <button
              type="button"
              className={`focus-studio__reset ${confirmingFinish ? "is-confirming" : ""}`}
              onClick={handleFinish}
            >
              {confirmingFinish ? copy.actions.confirmFinish : copy.actions.finish}
            </button>
            {onCollapse && (
              <button type="button" className="focus-studio__minimize" onClick={onCollapse}>
                {copy.minimize}
              </button>
            )}
          </div>
        </div>
      )}

      {focus.status === "recovery" && (
        <div className="recovery-panel recovery-panel--studio">
          <div className="panel-label">{copy.actions.takeBreak}</div>
          <EnsoProgress
            progress={Math.min(
              100,
              ((focus.recoveryMinutes * 60 - recoveryRemaining) /
                Math.max(1, focus.recoveryMinutes * 60)) *
                100,
            )}
            label={fmtTimer(recoveryRemaining)}
            reducedMotion={reducedMotion}
            variant="studio"
            kanji="休"
          />
          <p>{copy.focus.recoveryHint}</p>
          <div className="button-row">
            <button type="button" className="btn-primary" onClick={() => onAction("complete-recovery")}>
              {copy.actions.recoveryComplete}
            </button>
            <button type="button" className="btn-ghost" onClick={() => onAction("skip-recovery")}>
              {copy.actions.skip}
            </button>
            {onCollapse && (
              <button type="button" className="btn-ghost" onClick={onCollapse}>
                {copy.minimize}
              </button>
            )}
          </div>
        </div>
      )}

      {focus.status === "review" && (
        <SessionReview focus={focus} onComplete={onCompleteReview} onReset={() => onAction("reset")} />
      )}
    </section>
  );
}

type ReviewQuality = "distracted" | "shallow" | "normal" | "deep";

const QUALITY_DEPTH: Record<ReviewQuality, number> = {
  distracted: 1,
  shallow: 2,
  normal: 3,
  deep: 5,
};

function SessionReview({
  focus,
  onComplete,
  onReset,
}: {
  focus: FocusSession;
  onComplete: FocusPanelProps["onCompleteReview"];
  onReset: () => void;
}) {
  const copy = useCopy();
  const [quality, setQuality] = useState<ReviewQuality>("normal");
  const [nextAction, setNextAction] = useState("");

  return (
    <div className="session-review">
      <div className="panel-label">{copy.review.title}</div>
      <p className="focus-objective">{focus.objective}</p>
      <p className="setting-hint">{copy.review.hint}</p>
      <div
        className="segmented-control session-review__quality session-review__quality--four"
        role="group"
        aria-label={copy.review.title}
      >
        {(["distracted", "shallow", "normal", "deep"] as const).map((level) => (
          <button
            key={level}
            type="button"
            className={quality === level ? "is-active" : ""}
            aria-pressed={quality === level}
            onClick={() => setQuality(level)}
          >
            {copy.review.quality[level]}
          </button>
        ))}
      </div>
      <input
        className="text-input session-review__next-action"
        value={nextAction}
        onChange={(e) => setNextAction(e.target.value)}
        placeholder={copy.review.nextActionPlaceholder}
        maxLength={120}
        data-exclude-roam
      />
      <div className="button-row session-review__actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => onComplete({ depth: QUALITY_DEPTH[quality], nextAction })}
        >
          {copy.review.save}
        </button>
        <button type="button" className="btn-ghost" onClick={onReset}>
          {copy.actions.discard}
        </button>
      </div>
      <button
        type="button"
        className="studio-link studio-link--underline session-review__unwind"
        onClick={() => onComplete({ depth: QUALITY_DEPTH[quality], nextAction }, { goToUnwind: true })}
      >
        {copy.review.goUnwind}
      </button>
    </div>
  );
}
