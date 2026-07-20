import { AibaBust } from "./AibaBust";
import { AskAiba } from "./AskAiba";
import { StudioPhaseNav } from "./StudioPhaseNav";
import { useCopy } from "../context/CopyContext";
import type { AibaBehavior } from "../hooks/useAibaBehavior";
import type { HelpResult } from "../hooks/useHelp";
import type { AibaMood, AppLocale, TimeMode } from "../types/app";

interface StudioSidebarProps {
  timeMode: TimeMode;
  locale: AppLocale;
  mood: AibaMood;
  behavior: AibaBehavior;
  sleeping: boolean;
  reducedMotion: boolean;
  displayName: string;
  onTimeMode: (mode: TimeMode) => void;
  onCollapse: () => void;
  onOpenPreferences: () => void;
  onAskAction: (action: HelpResult["actions"][number]) => void;
}

export function StudioSidebar({
  timeMode,
  locale,
  mood,
  behavior,
  sleeping,
  reducedMotion,
  displayName,
  onTimeMode,
  onCollapse,
  onOpenPreferences,
  onAskAction,
}: StudioSidebarProps) {
  const copy = useCopy();
  const aibaBehavior = sleeping ? "sleep" : behavior;
  const name = displayName.trim();

  return (
    <aside
      className={`studio-sidebar ${sleeping ? "studio-sidebar--sleep" : ""}`}
      aria-label={copy.studio.title}
    >
      <div className="studio-sidebar__portrait">
        <div className="studio-sidebar__avatar">
          <AibaBust
            variant="studio"
            mood={mood}
            behavior={aibaBehavior}
            reducedMotion={reducedMotion}
          />
        </div>
        <p className="studio-sidebar__greeting">
          {name ? copy.studio.helloUser(name) : copy.studio.helloFallback}
        </p>
      </div>

      <StudioPhaseNav timeMode={timeMode} onSelect={onTimeMode} />

      <div className="studio-sidebar__ask">
        <AskAiba locale={locale} onAction={onAskAction} />
      </div>

      <div className="studio-sidebar__footer">
        <div className="studio-sidebar__links">
          <button
            type="button"
            className="studio-sidebar__link"
            onClick={onCollapse}
          >
            {copy.minimize}
          </button>
          <span className="studio-sidebar__link-sep" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className="studio-sidebar__link"
            onClick={onOpenPreferences}
          >
            {copy.nav.preferences}
          </button>
        </div>
      </div>
    </aside>
  );
}
