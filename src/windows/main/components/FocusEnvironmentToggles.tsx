import { useCopy } from "../context/CopyContext";
import { useToast } from "../context/ToastContext";
import { SettingHint } from "./SettingHint";
import type { AppData } from "../types/app";

interface FocusEnvironmentTogglesProps {
  data: AppData;
  onUpdate: (mutator: (draft: AppData) => void) => void;
  onTunnelVision: (enabled: boolean) => void;
  onGuard: (enabled: boolean) => void;
}

export function FocusEnvironmentToggles({
  data,
  onUpdate,
  onTunnelVision,
  onGuard,
}: FocusEnvironmentTogglesProps) {
  const copy = useCopy();
  const { showToast } = useToast();
  const desc = copy.settingDescriptions;

  return (
    <div className="focus-prep__toggles" data-exclude-roam>
      <div className="setting-row">
        <div className="setting-row__copy">
          <span className="setting-row__label">{copy.labels.tunnelVision}</span>
          <SettingHint text={desc.tunnelVision} />
        </div>
        <input
          type="checkbox"
          aria-label={copy.aria.tunnelVision}
          checked={data.settings.tunnelVision}
          onChange={(event) => {
            onTunnelVision(event.target.checked);
            showToast(
              event.target.checked ? copy.toast.tunnelVisionOn : copy.toast.tunnelVisionOff,
            );
          }}
        />
      </div>
      <div className="setting-row">
        <div className="setting-row__copy">
          <span className="setting-row__label">{copy.labels.deepWorkGuard}</span>
          <SettingHint text={desc.deepWorkGuard} />
        </div>
        <input
          type="checkbox"
          aria-label={copy.aria.deepWorkGuard}
          checked={data.settings.deepWorkGuard}
          onChange={(event) => {
            void onGuard(event.target.checked);
            showToast(
              event.target.checked ? copy.toast.deepWorkGuardOn : copy.toast.deepWorkGuardOff,
            );
          }}
        />
      </div>
      <div className="setting-row">
        <div className="setting-row__copy">
          <span className="setting-row__label">{copy.labels.reducedMotion}</span>
          <SettingHint text={desc.reducedMotion} />
        </div>
        <input
          type="checkbox"
          aria-label={copy.aria.reducedMotion}
          checked={data.settings.reducedMotion}
          onChange={(event) => {
            onUpdate((draft) => {
              draft.settings.reducedMotion = event.target.checked;
            });
            showToast(
              event.target.checked ? copy.toast.reducedMotionOn : copy.toast.reducedMotionOff,
            );
          }}
        />
      </div>
    </div>
  );
}
