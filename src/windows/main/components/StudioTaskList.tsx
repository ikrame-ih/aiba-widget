import type { ReactNode } from "react";
import { useState } from "react";
import { useCopy } from "../context/CopyContext";
import type { Priority } from "../types/app";

export interface StudioTaskListProps {
  priorities: Priority[];
  primaryTaskId: string | null;
  onAdd: (text: string) => boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => boolean;
  onPrimary: (id: string) => void;
  onClearCompleted?: () => void;
  onTaskActivate?: (task: Priority) => void;
  renderMeta?: (task: Priority, index: number) => ReactNode;
  renderAfterTitle?: (task: Priority, index: number) => ReactNode;
  renderRowAction?: (task: Priority, index: number) => ReactNode;
  showNextMark?: boolean;
}

export function StudioTaskList({
  priorities,
  primaryTaskId,
  onAdd,
  onToggle,
  onRemove,
  onUpdate,
  onPrimary,
  onClearCompleted,
  onTaskActivate,
  renderMeta,
  renderAfterTitle,
  renderRowAction,
  showNextMark = false,
}: StudioTaskListProps) {
  const copy = useCopy();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const nextTaskIndex = priorities.findIndex((task) => !task.done);

  const startEdit = (task: Priority) => {
    setEditingId(task.id);
    setEditDraft(task.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (onUpdate(editingId, editDraft)) {
      setEditingId(null);
      setEditDraft("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  return (
    <>
      <ul className="studio-task-list studio-task-list--v2" aria-label={copy.labels.tasks}>
        {priorities.map((priority, index) => {
          const isNext = !priority.done && index === nextTaskIndex;
          const isPrimary = priority.id === primaryTaskId;
          const isEditing = editingId === priority.id;

          return (
            <li
              key={priority.id}
              className={`studio-task studio-task--v2 ${index < priorities.length - 1 ? "has-rule" : ""} ${isPrimary ? "is-primary" : ""}`}
              data-exclude-roam
            >
              <button
                type="button"
                role="checkbox"
                className="studio-task__dot-btn"
                aria-label={copy.focus.markComplete(priority.text)}
                aria-checked={priority.done}
                onClick={() => onToggle(priority.id)}
              >
                <span
                  className={`studio-task__dot ${priority.done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
                />
              </button>

              <div className="studio-task__content">
                {isEditing ? (
                  <form
                    className="studio-task__edit-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveEdit();
                    }}
                  >
                    <input
                      className="studio-task__edit-input"
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.target.value)}
                      maxLength={80}
                      aria-label={copy.labels.editTask}
                      autoFocus
                    />
                    <div className="studio-task__edit-actions">
                      <button type="submit" className="studio-link studio-link--underline">
                        {copy.actions.saveTask}
                      </button>
                      <button
                        type="button"
                        className="studio-link studio-link--muted"
                        onClick={cancelEdit}
                      >
                        {copy.actions.cancelEdit}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="studio-task__row">
                      <button
                        type="button"
                        className={`studio-task__text ${priority.done ? "is-done" : ""} ${isNext ? "is-next" : "is-secondary"}`}
                        onClick={() => {
                          onPrimary(priority.id);
                          onTaskActivate?.(priority);
                        }}
                      >
                        {priority.text}
                      </button>
                      {!priority.done && (
                        <div className="studio-task__actions">
                          <button
                            type="button"
                            className="studio-task__icon-btn"
                            aria-label={copy.labels.editTask}
                            onClick={() => startEdit(priority)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="studio-task__icon-btn studio-task__icon-btn--danger"
                            aria-label={copy.labels.deleteTask}
                            onClick={() => onRemove(priority.id)}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    {renderMeta?.(priority, index)}
                    {renderAfterTitle?.(priority, index)}
                  </>
                )}
              </div>

              {!isEditing && renderRowAction?.(priority, index)}

              {showNextMark && isNext && !isEditing && (
                <span className="studio-task__next-mark" aria-hidden="true">
                  次
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {priorities.length < 3 && (
        <form
          className="studio-task-add studio-task-add--inline"
          data-exclude-roam
          onSubmit={(event) => {
            event.preventDefault();
            if (onAdd(draft)) setDraft("");
          }}
        >
          <span className="studio-task__dot-btn" aria-hidden="true">
            <span className="studio-task__dot studio-task__dot--ghost" />
          </span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            type="text"
            maxLength={80}
            aria-label={copy.labels.newTask}
            placeholder={copy.labels.addTaskPlaceholder}
          />
        </form>
      )}

      {priorities.length === 0 && (
        <p className="studio-task studio-task--empty">{copy.empty.priorities}</p>
      )}

      {onClearCompleted && priorities.some((p) => p.done) && (
        <button
          type="button"
          className="studio-link studio-link--muted studio-task-clear"
          onClick={onClearCompleted}
          data-exclude-roam
        >
          {copy.actions.clearCompleted}
        </button>
      )}
    </>
  );
}
