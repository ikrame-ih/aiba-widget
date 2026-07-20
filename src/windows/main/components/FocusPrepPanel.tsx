import { FocusEnvironmentToggles } from "./FocusEnvironmentToggles";
import { useCopy } from "../context/CopyContext";
import type { AppData, FocusSession, TaskType } from "../types/app";

const DURATION_PRESETS = [25, 45, 60, 90] as const;
const TASK_TYPES: TaskType[] = ["deep", "shallow", "learning", "collab"];

interface FocusPrepPanelProps {
  data: AppData;
  onUpdate: (mutator: (draft: AppData) => void) => void;
  onSessionField: <K extends keyof FocusSession>(field: K, value: FocusSession[K]) => void;
  onSessionAction: (action: "start") => void;
  onTunnelVision: (enabled: boolean) => void;
  onGuard: (enabled: boolean) => void;
  onOpenPreferences: () => void;
  onGoToPlan: () => void;
}

export function FocusPrepPanel({
  data,
  onUpdate,
  onSessionField,
  onSessionAction,
  onTunnelVision,
  onGuard,
  onOpenPreferences,
  onGoToPlan,
}: FocusPrepPanelProps) {
  const copy = useCopy();
  const session = data.focusSession;
  const objective = session.objective.trim();
  const hasTask = Boolean(objective);
  const canStart = hasTask && (session.status === "preparing" || session.status === "idle");

  if (!hasTask) {
    return (
      <section className="panel focus-prep focus-prep--direct" aria-label={copy.focusPrep.title}>
        <div className="panel-label">{copy.focusPrep.title}</div>
        <p className="panel-copy">{copy.focusPrep.directLead}</p>

        <div className="focus-prep__task" data-exclude-roam>
          <input
            className="focus-prep__objective-input"
            value={session.objective}
            onChange={(event) => onSessionField("objective", event.target.value)}
            placeholder={copy.labels.focusOutputPlaceholder}
            maxLength={120}
            aria-label={copy.labels.focusOutput}
          />
        </div>

        <div className="focus-prep__block" data-exclude-roam>
          <span className="focus-prep__block-label">{copy.focusPrep.duration}</span>
          <div className="segmented-control focus-prep__duration" role="group" aria-label={copy.labels.duration}>
            {DURATION_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={session.plannedMinutes === minutes ? "is-active" : ""}
                aria-pressed={session.plannedMinutes === minutes}
                onClick={() => onSessionField("plannedMinutes", minutes)}
              >
                {copy.focusPrep.durationMin(minutes)}
              </button>
            ))}
          </div>
        </div>

        <div className="focus-prep__footer" data-exclude-roam>
          <button
            type="button"
            className="studio-btn studio-btn--outline focus-prep__begin"
            disabled={!session.objective.trim()}
            onClick={() => onSessionAction("start")}
          >
            {copy.actions.begin}
          </button>
          <button type="button" className="studio-link studio-link--muted" onClick={onGoToPlan}>
            {copy.focusPrep.goToPlan}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel focus-prep" aria-label={copy.focusPrep.title}>
      <div className="panel-label">{copy.focusPrep.title}</div>

      <div className="focus-prep__task" data-exclude-roam>
        <span className="focus-prep__task-label">{copy.focusPrep.selectedTask}</span>
        <p className="focus-prep__task-text">{objective}</p>
        <button type="button" className="studio-link studio-link--muted" onClick={onGoToPlan}>
          {copy.focusPrep.changeTask}
        </button>
      </div>

      <div className="focus-prep__block" data-exclude-roam>
        <span className="focus-prep__block-label">{copy.focusPrep.duration}</span>
        <div className="segmented-control focus-prep__duration" role="group" aria-label={copy.labels.duration}>
          {DURATION_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={session.plannedMinutes === minutes ? "is-active" : ""}
              aria-pressed={session.plannedMinutes === minutes}
              onClick={() => onSessionField("plannedMinutes", minutes)}
            >
              {copy.focusPrep.durationMin(minutes)}
            </button>
          ))}
        </div>
      </div>

      <div className="focus-prep__block" data-exclude-roam>
        <span className="focus-prep__block-label">{copy.focusPrep.taskType}</span>
        <p className="setting-hint">{copy.focusPrep.taskTypeHint}</p>
        <div className="segmented-control focus-prep__types" role="group" aria-label={copy.focusPrep.taskType}>
          {TASK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={session.taskType === type ? "is-active" : ""}
              aria-pressed={session.taskType === type}
              onClick={() => onSessionField("taskType", type)}
            >
              {copy.taskTypes[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="focus-prep__block" data-exclude-roam>
        <span className="focus-prep__block-label">{copy.focusPrep.environment}</span>
        <FocusEnvironmentToggles
          data={data}
          onUpdate={onUpdate}
          onTunnelVision={onTunnelVision}
          onGuard={onGuard}
        />
      </div>

      <div className="focus-prep__footer" data-exclude-roam>
        <button
          type="button"
          className="studio-btn studio-btn--outline focus-prep__begin"
          disabled={!canStart}
          onClick={() => onSessionAction("start")}
        >
          {copy.actions.begin}
        </button>
        <button type="button" className="studio-link studio-link--underline" onClick={onOpenPreferences}>
          {copy.focusPrep.preferencesLink}
        </button>
      </div>
    </section>
  );
}

export function isFocusSessionActive(status: FocusSession["status"]) {
  return status === "focusing" || status === "paused" || status === "recovery" || status === "review";
}

