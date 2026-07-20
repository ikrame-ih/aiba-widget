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

  const stopEnvironment = useCallback(async () => {
    await Promise.all([
      window.api?.setTunnelVision(false),
      window.api?.removeSiteBlock(),
      window.api?.setFocusGuard({ enabled: false }).then(setGuardStatus),
    ]);
  }, []);

  const startEnvironment = useCallback(async () => {
    if (data.settings.tunnelVision) {
      await window.api?.setTunnelVision(true);
    }
    if (data.settings.deepWorkGuard) {
      const status = await window.api?.setFocusGuard({ enabled: true });
      if (status) setGuardStatus(status);
    }
  }, [data.settings.deepWorkGuard, data.settings.tunnelVision]);

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
