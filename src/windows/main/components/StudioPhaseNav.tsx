import { useCopy } from "../context/CopyContext";
import type { TimeMode } from "../types/app";

interface StudioPhaseNavProps {
  timeMode: TimeMode;
  onSelect: (mode: TimeMode) => void;
}

export function StudioPhaseNav({ timeMode, onSelect }: StudioPhaseNavProps) {
  const copy = useCopy();

  const dayParts: Array<{ mode: TimeMode; label: string; icon: string }> = [
    { mode: "morning", label: copy.phases.morning.action, icon: "晨" },
    { mode: "afternoon", label: copy.phases.afternoon.action, icon: "午" },
    { mode: "evening", label: copy.phases.evening.action, icon: "暮" },
  ];

  return (
    <nav className="studio-phase-nav" aria-label={copy.aria.phaseNav}>
      {dayParts.map(({ mode, label, icon }) => {
        const isActive = timeMode === mode;

        return (
          <button
            key={mode}
            type="button"
            className={`studio-phase-nav__item studio-phase-nav__item--${mode} ${isActive ? "is-active" : ""}`}
            aria-pressed={isActive}
            aria-label={label}
            onClick={() => onSelect(mode)}
          >
            <span className="studio-phase-nav__kanji">{icon}</span>
            <span className="studio-phase-nav__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
