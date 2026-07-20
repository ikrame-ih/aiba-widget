import { useCopy } from "../../context/CopyContext";
import { getFlowInsights } from "../../../../shared/data-schema.js";
import type { AppData, TaskType } from "../../types/app";

function taskTypeLabel(type: TaskType, copy: ReturnType<typeof useCopy>) {
  return copy.taskTypes[type] ?? type;
}

export function SessionsPanel({ data }: { data: Pick<AppData, "flowSessions"> }) {
  const copy = useCopy();
  const insights = getFlowInsights(data.flowSessions);
  const count = data.flowSessions.length;
  const enoughData = count >= 3;

  return (
    <section className="panel history-panel" aria-label={copy.nav.sessions}>
      <div className="panel-label">{copy.nav.sessions}</div>
      <p className="panel-copy">{copy.navDescriptions.sessions}</p>

      {count === 0 && <p className="empty-state">{copy.empty.sessionsNone}</p>}
      {count > 0 && count < 3 && (
        <p className="panel-copy panel-copy--emphasis">{copy.empty.sessionsEarly}</p>
      )}

      {enoughData && (
        <div className="flow-grid">
          <div className="flow-card">
            <strong>
              {insights.bestHour === null ? "—" : `${String(insights.bestHour).padStart(2, "0")}:00`}
            </strong>
            <span>{copy.labels.bestFocusHour}</span>
            {insights.bestHour === null && (
              <span className="flow-card__hint">{copy.patterns.bestHourEmpty}</span>
            )}
          </div>
          <div className="flow-card">
            <strong>
              {insights.bestType ? taskTypeLabel(insights.bestType as TaskType, copy) : "—"}
            </strong>
            <span>{copy.labels.bestTaskType}</span>
            {!insights.bestType && (
              <span className="flow-card__hint">{copy.patterns.bestTypeEmpty}</span>
            )}
          </div>
          <div className="flow-card">
            <strong>{insights.avgDepth ? insights.avgDepth.toFixed(1) : "—"}</strong>
            <span>{copy.labels.averageDepth}</span>
          </div>
          <div className="flow-card">
            <strong>{Math.round(insights.completionRate * 100)}%</strong>
            <span>{copy.labels.completionRate}</span>
          </div>
        </div>
      )}

      {count > 0 && (
        <div className="session-list">
          {data.flowSessions
            .slice(-6)
            .reverse()
            .map((session) => (
              <article className="session-row" key={session.id}>
                <div>
                  <strong>{session.task}</strong>
                  <span>
                    {taskTypeLabel(session.taskType, copy)} · {copy.labels.sessionMinutes(session.actualMinutes)}
                  </span>
                </div>
                <span>
                  {copy.labels.depth} {session.depth}/5
                </span>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
