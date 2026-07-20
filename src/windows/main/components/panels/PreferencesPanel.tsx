import { useEffect, useState } from "react";
import { useCopy } from "../../context/CopyContext";
import { useToast } from "../../context/ToastContext";
import { DEFAULT_BLOCKED_SITES } from "../../../../shared/data-schema.js";
import { guardBannerText } from "../../lib/guardCopy";
import { SettingHint } from "../SettingHint";
import type { AppData, AppLocale, GuardStatus } from "../../types/app";

interface PreferencesPanelProps {
  data: AppData;
  guardStatus: GuardStatus | null;
  onUpdate: (mutator: (draft: AppData) => void) => void;
  onTunnelVision: (enabled: boolean) => void;
  onGuard: (enabled: boolean) => void;
  onGuardStatus: (status: GuardStatus) => void;
}

function parseBlockedSites(text: string) {
  return text
    .split(/\r?\n/)
    .map((site) => site.trim())
    .filter(Boolean);
}

function ToggleSetting({
  label,
  hint,
  checked,
  ariaLabel,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="setting-row" data-exclude-roam>
      <div className="setting-row__copy">
        <span className="setting-row__label">{label}</span>
        <SettingHint text={hint} />
      </div>
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}

export function PreferencesPanel({
  data,
  guardStatus,
  onUpdate,
  onTunnelVision,
  onGuard,
  onGuardStatus,
}: PreferencesPanelProps) {
  const copy = useCopy();
  const { showToast } = useToast();
  const desc = copy.settingDescriptions;
  const sitesKey = data.settings.blockedSites.join("\n");
  const [domainsDraft, setDomainsDraft] = useState(sitesKey);

  useEffect(() => {
    setDomainsDraft(sitesKey);
  }, [sitesKey]);

  const commitDomains = (text: string) => {
    const parsed = parseBlockedSites(text);
    if (parsed.join("\n") === sitesKey) return;
    onUpdate((draft) => {
      draft.settings.blockedSites = parsed;
    });
  };

  const banner =
    guardStatus &&
    (guardStatus.active || guardStatus.sitesBlocked || guardStatus.helperRunning)
      ? guardBannerText(guardStatus, copy)
      : "";

  const applySiteBlock = async () => {
    commitDomains(domainsDraft);
    const blockedSites = parseBlockedSites(domainsDraft);
    const status = await window.api?.applySiteBlock({ blockedSites });
    if (status) onGuardStatus(status);
    showToast(copy.toast.siteBlockApplied);
  };

  const removeSiteBlock = async () => {
    const status = await window.api?.removeSiteBlock();
    if (status) onGuardStatus(status);
    showToast(copy.toast.siteBlockRemoved);
  };

  const restoreDefaultSites = () => {
    const defaults = DEFAULT_BLOCKED_SITES.join("\n");
    setDomainsDraft(defaults);
    onUpdate((draft) => {
      draft.settings.blockedSites = [...DEFAULT_BLOCKED_SITES];
    });
    showToast(copy.toast.defaultSitesRestored);
  };

  return (
    <section className="panel settings-panel" aria-label={copy.nav.preferences}>
      <div className="panel-label">{copy.nav.preferences}</div>
      <p className="panel-copy">{copy.navDescriptions.preferences}</p>

      <div className="settings-group">
        <h3 className="settings-group__title">{copy.settingsGroups.profile}</h3>
        <label className="field-block field-block--stacked" data-exclude-roam>
          <span>{copy.labels.displayName}</span>
          <SettingHint text={desc.displayName} />
          <input
            className="text-input"
            value={data.settings.displayName}
            onChange={(event) =>
              onUpdate((draft) => {
                draft.settings.displayName = event.target.value.slice(0, 40);
              })
            }
            placeholder={copy.labels.displayNamePlaceholder}
            maxLength={40}
          />
        </label>
      </div>

      <div className="settings-group">
        <h3 className="settings-group__title">{copy.settingsGroups.appearance}</h3>
        <SettingHint text={desc.appearance} />
        <div className="segmented-control theme-toggle" data-exclude-roam role="group" aria-label={copy.labels.appearance}>
          <button
            type="button"
            className={data.settings.theme === "dark" ? "is-active" : ""}
            aria-pressed={data.settings.theme === "dark"}
            onClick={() => {
              onUpdate((draft) => {
                draft.settings.theme = "dark";
              });
              showToast(copy.toast.themeDark);
            }}
          >
            {copy.labels.themeDark}
          </button>
          <button
            type="button"
            className={data.settings.theme === "light" ? "is-active" : ""}
            aria-pressed={data.settings.theme === "light"}
            onClick={() => {
              onUpdate((draft) => {
                draft.settings.theme = "light";
              });
              showToast(copy.toast.themeLight);
            }}
          >
            {copy.labels.themeLight}
          </button>
        </div>

        <label className="field-block field-block--stacked" data-exclude-roam>
          <span>{copy.labels.language}</span>
          <SettingHint text={desc.language} />
          <select
            aria-label={copy.labels.language}
            value={data.settings.language}
            onChange={(event) =>
              onUpdate((draft) => {
                draft.settings.language = event.target.value as AppLocale;
              })
            }
          >
            <option value="en">{copy.language.en}</option>
            <option value="es">{copy.language.es}</option>
          </select>
        </label>

        <ToggleSetting
          label={copy.labels.reducedMotion}
          hint={desc.reducedMotion}
          ariaLabel={copy.aria.reducedMotion}
          checked={data.settings.reducedMotion}
          onChange={(checked) => {
            onUpdate((draft) => {
              draft.settings.reducedMotion = checked;
            });
            showToast(checked ? copy.toast.reducedMotionOn : copy.toast.reducedMotionOff);
          }}
        />
      </div>

      <div className="settings-group">
        <h3 className="settings-group__title">{copy.settingsGroups.focus}</h3>
        <ToggleSetting
          label={copy.labels.tunnelVision}
          hint={desc.tunnelVision}
          ariaLabel={copy.aria.tunnelVision}
          checked={data.settings.tunnelVision}
          onChange={(checked) => {
            onTunnelVision(checked);
            showToast(checked ? copy.toast.tunnelVisionOn : copy.toast.tunnelVisionOff);
          }}
        />
        <ToggleSetting
          label={copy.labels.deepWorkGuard}
          hint={desc.deepWorkGuard}
          ariaLabel={copy.aria.deepWorkGuard}
          checked={data.settings.deepWorkGuard}
          onChange={async (checked) => {
            await onGuard(checked);
            showToast(checked ? copy.toast.deepWorkGuardOn : copy.toast.deepWorkGuardOff);
          }}
        />
      </div>

      <div className="settings-group settings-group--sites">
        <h3 className="settings-group__title">{copy.settingsGroups.sites}</h3>
        <ToggleSetting
          label={copy.labels.blockSites}
          hint={desc.blockSites}
          ariaLabel={copy.aria.blockSites}
          checked={data.settings.helperEnabled}
          onChange={(checked) => {
            onUpdate((draft) => {
              draft.settings.helperEnabled = checked;
            });
            showToast(checked ? copy.toast.blockSitesOn : copy.toast.blockSitesOff);
          }}
        />

        {data.settings.helperEnabled && (
          <div className="settings-domains">
            <label className="field-block field-block--stacked" data-exclude-roam>
              <span>{copy.labels.domains}</span>
              <SettingHint text={desc.domains} />
              <textarea
                className="textarea settings-domains__input"
                rows={5}
                value={domainsDraft}
                onChange={(event) => setDomainsDraft(event.target.value)}
                onBlur={() => commitDomains(domainsDraft)}
                placeholder={copy.labels.domainsPlaceholder}
              />
            </label>
            <p className="panel-copy panel-copy--emphasis settings-domains__hint">
              {copy.labels.siteBlockHint}
            </p>
            <div className="button-row settings-actions settings-actions--inline">
              <button
                type="button"
                className="btn-ghost settings-action"
                data-exclude-roam
                onClick={() => void applySiteBlock()}
              >
                {copy.labels.applySiteBlock}
              </button>
              <button
                type="button"
                className="btn-ghost settings-action"
                data-exclude-roam
                disabled={!guardStatus?.sitesBlocked}
                onClick={() => void removeSiteBlock()}
              >
                {copy.labels.removeSiteBlock}
              </button>
              <button
                type="button"
                className="btn-ghost settings-action"
                data-exclude-roam
                onClick={restoreDefaultSites}
              >
                {copy.labels.restoreDefaultSites}
              </button>
            </div>
            {!guardStatus?.sitesBlocked && (
              <p className="setting-hint settings-domains__revert-hint">{copy.labels.removeSiteBlockHint}</p>
            )}
          </div>
        )}
      </div>

      <div className="settings-group">
        <h3 className="settings-group__title">{copy.settingsGroups.links}</h3>
        <div className="button-row settings-actions settings-actions--stack">
          <div className="settings-link-card" data-exclude-roam>
            <button
              type="button"
              className="btn-ghost settings-action"
              onClick={() => window.api?.openFocusAssist()}
            >
              {copy.labels.openWindowsFocus}
            </button>
            <SettingHint text={desc.openWindowsFocus} />
          </div>
          <div className="settings-link-card" data-exclude-roam>
            <button
              type="button"
              className="btn-ghost settings-action"
              onClick={() => window.api?.openHelpWindow(data.settings.language)}
            >
              {copy.labels.openFocusGuide}
            </button>
            <SettingHint text={desc.openFocusGuide} />
          </div>
        </div>
      </div>

      {banner && (
        <div className="guard-banner" data-exclude-roam>
          {banner}
        </div>
      )}
    </section>
  );
}
