import { useState } from "react";
import { SessionsPanel } from "./panels/SessionsPanel";
import { StudioMarginSection } from "./StudioMarginSection";
import { StudioTaskList } from "./StudioTaskList";
import { useCopy } from "../context/CopyContext";
import type { AppData, Priority } from "../types/app";

interface TodayStudioViewProps {
  priorities: AppData["priorities"];
  dailyOutcome: string;
  openLoops: string;
  flowSessions: AppData["flowSessions"];
  shutdownNextAction: string;
  primaryTaskId: string | null;
  onAdd: (text: string) => boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => boolean;
  onOutcome: (value: string) => void;
  onPrimary: (id: string) => void;
  onOpenLoops: (value: string) => void;
  onSelectTaskForFocus: (task: Priority) => void;
  onClearCompleted: () => void;
}

function fmtSessionDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:00`;
  return `${String(m).padStart(2, "0")}:00`;
}

export function TodayStudioView({
  priorities,
  dailyOutcome,
  openLoops,
  flowSessions,
  shutdownNextAction,
  primaryTaskId,
  onAdd,
  onToggle,
  onRemove,
  onUpdate,
  onOutcome,
  onPrimary,
  onOpenLoops,
  onSelectTaskForFocus,
  onClearCompleted,
}: TodayStudioViewProps) {
  const copy = useCopy();
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [tomorrowDismissed, setTomorrowDismissed] = useState(false);
  const recentSessions = flowSessions.slice(-3).reverse();
  const sections = copy.studio.sections;
  const tomorrowStep = shutdownNextAction.trim();
  const showTomorrowPrompt =
    !tomorrowDismissed &&
    tomorrowStep.length > 0 &&
    !priorities.some((task) => task.text.trim() === tomorrowStep) &&
    priorities.length < 3;

  if (historyExpanded) {
    return (
      <div className="today-studio today-studio--history">
        <button
          type="button"
          className="studio-back-link"
          onClick={() => setHistoryExpanded(false)}
        >
          ← {copy.studio.backToPlan}
        </button>
        <SessionsPanel data={{ flowSessions } as AppData} />
      </div>
    );
  }

  return (
    <div className="today-studio">
      <div className="core-intent core-intent--v2" data-exclude-roam>
        <p className="core-intent__lead">
          <span className="core-intent__lead-kanji">{sections.today.jp}</span>
          <span className="core-intent__lead-text">{copy.studio.todayLead}</span>
        </p>
        <input
          className="core-intent__title"
          value={dailyOutcome}
          onChange={(event) => onOutcome(event.target.value)}
          placeholder={copy.studio.todayPlaceholder}
          maxLength={120}
          aria-label={copy.labels.mainGoal}
        />
      </div>

      {showTomorrowPrompt && (
        <div className="plan-tomorrow-prompt" data-exclude-roam>
          <p className="plan-tomorrow-prompt__text">{copy.plan.tomorrowPrompt(tomorrowStep)}</p>
          <p className="setting-hint">{copy.plan.tomorrowHint}</p>
          <div className="plan-tomorrow-prompt__actions">
            <button
              type="button"
              className="studio-link studio-link--underline"
              onClick={() => {
                if (onAdd(tomorrowStep)) setTomorrowDismissed(true);
              }}
            >
              {copy.plan.addTomorrowStep}
            </button>
            <button
              type="button"
              className="studio-link studio-link--muted"
              onClick={() => setTomorrowDismissed(true)}
            >
              {copy.plan.dismissTomorrow}
            </button>
          </div>
        </div>
      )}

      <StudioMarginSection kanji={sections.tasks.jp} label={copy.labels.tasks}>
        <StudioTaskList
          priorities={priorities}
          primaryTaskId={primaryTaskId}
          onAdd={onAdd}
          onToggle={onToggle}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onPrimary={onPrimary}
          onClearCompleted={onClearCompleted}
          showNextMark={false}
          renderRowAction={(task) =>
            !task.done ? (
              <button
                type="button"
                className="studio-task__focus-btn"
                onClick={() => onSelectTaskForFocus(task)}
              >
                {copy.actions.startFocus}
              </button>
            ) : null
          }
        />
      </StudioMarginSection>

      <StudioMarginSection kanji={sections.notes.jp} label={copy.studio.notesLabel}>
        <textarea
          className="studio-ruled-input"
          value={openLoops}
          onChange={(event) => onOpenLoops(event.target.value)}
          placeholder={copy.studio.notesPlaceholder}
          rows={3}
          aria-label={copy.nav.notes}
        />
      </StudioMarginSection>

      <StudioMarginSection
        kanji={sections.history.jp}
        label={sections.history.label}
        sectionId="history"
        action={
          <button type="button" className="studio-link studio-link--underline" onClick={() => setHistoryExpanded(true)}>
            {copy.studio.viewAll}
          </button>
        }
      >
        {recentSessions.length === 0 ? (
          <p className="studio-history-empty">{copy.empty.sessionsNone}</p>
        ) : (
          <ul className="studio-history-list studio-history-list--v2">
            {recentSessions.map((session) => (
              <li key={session.id} className="studio-history-row studio-history-row--v2">
                <span>{session.task}</span>
                <span className="studio-history-row__leader" aria-hidden="true" />
                <span className="studio-history-row__time">{fmtSessionDuration(session.actualMinutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </StudioMarginSection>
    </div>
  );
}
