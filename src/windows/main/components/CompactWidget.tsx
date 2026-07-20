import { EnsoProgress } from "./EnsoProgress";
import { useCopy } from "../context/CopyContext";
import { getFocusElapsed, getRecoveryRemaining } from "../../../shared/session-machine.js";
import { fmtTimer } from "../lib/time";
import type { AppData } from "../types/app";

interface CompactWidgetProps {
  now: Date;
  data: AppData;
  onExpand: () => void;
  onOpenPreferences: () => void;
  onSessionAction: (
    action: "prepare" | "start" | "pause" | "resume" | "finish" | "complete-recovery" | "skip-recovery" | "reset",
  ) => void;
}

export function CompactWidget({ now, data, onExpand, onOpenPreferences, onSessionAction }: CompactWidgetProps) {
  const copy = useCopy();
  const session = data.focusSession;
  const status = session.status;
  const focusing = status === "focusing" || status === "paused";
  const recovering = status === "recovery";

  const elapsed = getFocusElapsed(session, now.getTime());
  const focusRemaining = Math.max(0, session.plannedMinutes * 60 - elapsed);
  const recoveryRemaining = getRecoveryRemaining(session, now.getTime());
  const focusProgress = focusing
    ? Math.min(100, (elapsed / Math.max(1, session.plannedMinutes * 60)) * 100)
    : 0;
  const recoveryProgress = recovering
    ? Math.min(
        100,
        ((session.recoveryMinutes * 60 - recoveryRemaining) /
          Math.max(1, session.recoveryMinutes * 60)) *
          100,
      )
    : 0;

  const statusLabel = focusing
    ? status === "paused"
      ? copy.compact.paused
      : copy.compact.focusing
    : recovering
      ? copy.compact.recovery
      : copy.compact.ready;

  const timerLabel = focusing
    ? fmtTimer(focusRemaining)
    : recovering
      ? fmtTimer(recoveryRemaining)
      : fmtTimer(session.plannedMinutes * 60);

  const pathLabel = session.objective.trim() || copy.labels.focusOutputPlaceholder;
  const phaseLabel = copy.studio.phaseHeader[data.settings.timeMode];
  const pillClass = focusing
    ? status === "paused"
      ? "status-pill--paused"
      : "status-pill--focusing"
    : recovering
      ? "status-pill--recovery"
      : "status-pill--ready";

  return (
    <div className="compact-focus widget widget--compact" data-session={status} data-time-mode={data.settings.timeMode}>
      <div className="compact-focus__accent" aria-hidden="true" />

      <header className="compact-focus__header">
        <div className="compact-focus__brand">
          <span className="compact-focus__phase">{phaseLabel}</span>
          <div className="compact-focus__status">
            <span className={`status-pill ${pillClass}`}>
              <span className="status-pill__dot" aria-hidden="true" />
              <span className="compact-focus__status-text">{statusLabel}</span>
            </span>
          </div>
        </div>
        <div className="compact-focus__meta">
          <button
            type="button"
            className="compact-focus__prefs"
            onClick={onOpenPreferences}
            title={copy.nav.preferences}
            aria-label={copy.nav.preferences}
          >
            ⚙
          </button>
          <button
            type="button"
            className="compact-focus__expand"
            onClick={onExpand}
            title={copy.expand}
            aria-label={copy.expand}
          >
            <span className="compact-focus__expand-icon" aria-hidden="true">
              ⤢
            </span>
          </button>
          <button
            type="button"
            className="compact-focus__hide"
            aria-label={copy.hideWidget}
            onClick={() => window.api?.closeWindow()}
          >
            ×
          </button>
        </div>
      </header>

      <div className="compact-focus__stage">
        <EnsoProgress
          variant="studio"
          studioSize={208}
          progress={focusing ? focusProgress : recovering ? recoveryProgress : 0}
          label={timerLabel}
          reducedMotion={data.settings.reducedMotion}
          showKanji={false}
        />
      </div>

      <footer className="compact-focus__footer">
        <div className="compact-focus__path">
          <span className="compact-focus__path-label">{copy.compact.currentPath}</span>
          <p className="compact-focus__path-text u-line-clamp-2">{pathLabel}</p>
        </div>

        {focusing ? (
          <button
            type="button"
            className="compact-focus__pause"
            onClick={() => onSessionAction(status === "paused" ? "resume" : "pause")}
          >
            {status === "paused" ? copy.actions.resume : copy.actions.pause}
          </button>
        ) : recovering ? (
          <button
            type="button"
            className="compact-focus__pause"
            onClick={() => onSessionAction("complete-recovery")}
          >
            {copy.actions.recoveryComplete}
          </button>
        ) : (
          <div className="compact-focus__footer-spacer" aria-hidden="true" />
        )}
      </footer>
    </div>
  );
}
