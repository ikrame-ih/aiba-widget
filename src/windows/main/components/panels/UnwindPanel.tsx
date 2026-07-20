import { useMemo } from "react";
import { StudioMarginSection } from "../StudioMarginSection";
import { useCopy } from "../../context/CopyContext";
import type { AppData } from "../../types/app";

interface UnwindPanelProps {
  shutdown: AppData["shutdown"];
  priorities: AppData["priorities"];
  flowSessions: AppData["flowSessions"];
  onField: <K extends keyof AppData["shutdown"]>(
    field: K,
    value: AppData["shutdown"][K],
  ) => void;
}

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function UnwindPanel({
  shutdown,
  priorities,
  flowSessions,
  onField,
}: UnwindPanelProps) {
  const copy = useCopy();
  const sections = copy.studio.sections;

  const daySummary = useMemo(() => {
    const dayStart = startOfDay(new Date());
    const todaySessions = flowSessions.filter((s) => s.endedAt >= dayStart);
    const totalMinutes = todaySessions.reduce(
      (sum, s) => sum + s.actualMinutes,
      0,
    );
    const doneCount = priorities.filter((p) => p.done).length;
    return { sessionCount: todaySessions.length, totalMinutes, doneCount };
  }, [flowSessions, priorities]);

  return (
    <section
      className="panel unwind-panel unwind-studio"
      aria-label={copy.studio.phaseHeader.evening}
    >
      <div className="unwind-studio__intro">
        <p className="unwind-studio__kicker">
          <span className="unwind-studio__kicker-kanji">夕暮れ</span>
          <span className="unwind-studio__kicker-sep" aria-hidden="true">
            ·
          </span>
          <span className="unwind-studio__kicker-text">
            {copy.studio.unwindLead}
          </span>
        </p>
        <h2 className="unwind-studio__headline">
          {copy.studio.eveningHeadline}
        </h2>
      </div>

      <div className="unwind-studio__summary">
        <div className="flow-card">
          <strong>{daySummary.sessionCount}</strong>
          <span>{copy.unwind.sessionsToday}</span>
        </div>
        <div className="flow-card">
          <strong>{daySummary.totalMinutes} min</strong>
          <span>{copy.unwind.focusMinutes}</span>
        </div>
        <div className="flow-card">
          <strong>
            {daySummary.doneCount}/{priorities.length}
          </strong>
          <span>{copy.unwind.tasksCompleted}</span>
        </div>
      </div>

      <StudioMarginSection
        kanji={sections.wentWell.jp}
        label={sections.wentWell.label}
      >
        <textarea
          className="studio-ruled-input"
          rows={3}
          value={shutdown.sessionOutcome}
          onChange={(event) => onField("sessionOutcome", event.target.value)}
          placeholder={copy.empty.shutdown}
          aria-label={copy.labels.unwindWentWell}
          data-exclude-roam
        />
      </StudioMarginSection>

      <StudioMarginSection
        kanji={sections.tomorrow.jp}
        label={sections.tomorrow.label}
      >
        <input
          id="unwind-next-step"
          className="unwind-studio__input unwind-studio__input--subtle"
          value={shutdown.nextAction}
          onChange={(event) => onField("nextAction", event.target.value)}
          placeholder={copy.labels.unwindTomorrowPlaceholder}
          aria-label={copy.labels.unwindTomorrow}
          data-exclude-roam
        />
      </StudioMarginSection>
    </section>
  );
}
