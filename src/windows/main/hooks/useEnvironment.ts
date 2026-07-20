import { useCallback, useEffect, useState } from "react";
import type { AppData, FocusSession, GuardStatus } from "../types/app";

interface UseEnvironmentOptions {
  data: AppData;
  update: (mutator: (draft: AppData) => void) => void;
  isFocusing: boolean;
}

export function useEnvironment({ data, update, isFocusing }: UseEnvironmentOptions) {
  const [guardStatus, setGuardStatus] = useState<GuardStatus | null>(null);

  useEffect(() => {
    window.api?.getGuardStatus().then(setGuardStatus);
  }, []);

  const startEnvironment = useCallback(async () => {
    if (data.settings.tunnelVision) {
      await window.api?.setTunnelVision(true);
    }
    if (data.settings.deepWorkGuard) {
      const status = await window.api?.setFocusGuard({ enabled: true });
      if (status) setGuardStatus(status);
    }
    if (data.settings.helperEnabled) {
      const status = await window.api?.applySiteBlock({
        blockedSites: data.settings.blockedSites,
      });
      if (status) setGuardStatus(status);
    }
  }, [
    data.settings.blockedSites,
    data.settings.deepWorkGuard,
    data.settings.helperEnabled,
    data.settings.tunnelVision,
  ]);

  const stopEnvironment = useCallback(async () => {
    const [, , status] = await Promise.all([
      window.api?.setTunnelVision(false),
      window.api?.setFocusGuard({ enabled: false }),
      window.api?.removeSiteBlock(),
    ]);
    if (status) setGuardStatus(status);
    else {
      const next = await window.api?.getGuardStatus();
      if (next) setGuardStatus(next);
    }
  }, []);

  const handleTunnelVision = useCallback(
    (enabled: boolean) => {
      update((draft) => {
        draft.settings.tunnelVision = enabled;
      });
      if (isFocusing) void window.api?.setTunnelVision(enabled);
      if (!enabled) void window.api?.setTunnelVision(false);
    },
    [isFocusing, update],
  );

  const handleGuard = useCallback(
    async (enabled: boolean) => {
      update((draft) => {
        draft.settings.deepWorkGuard = enabled;
      });
      if (!enabled) {
        const status = await window.api?.setFocusGuard({ enabled: false });
        if (status) setGuardStatus(status);
        return;
      }
      if (isFocusing) {
        const status = await window.api?.setFocusGuard({ enabled: true });
        if (status) setGuardStatus(status);
      }
    },
    [isFocusing, update],
  );

  return {
    guardStatus,
    setGuardStatus,
    startEnvironment,
    stopEnvironment,
    handleTunnelVision,
    handleGuard,
  };
}
