import { useEffect, useState } from "react";
import type { SessionStatus, TimeMode } from "../types/app";

export type AibaBehavior = "idle" | "glance" | "sleep" | "static";

interface UseAibaBehaviorOptions {
  timeMode: TimeMode;
  sessionStatus: SessionStatus;
  reducedMotion?: boolean;
}

export function useAibaBehavior({
  timeMode,
  sessionStatus,
  reducedMotion = false,
}: UseAibaBehaviorOptions) {
  const isSleeping = timeMode === "evening" && sessionStatus === "idle";
  const [pulse, setPulse] = useState<"idle" | "glance">("idle");

  useEffect(() => {
    if (isSleeping || reducedMotion) {
      setPulse("idle");
      return;
    }

    let glanceTimer: number | undefined;
    const loop = window.setInterval(() => {
      setPulse("glance");
      glanceTimer = window.setTimeout(() => setPulse("idle"), 2200);
    }, 9000);

    return () => {
      window.clearInterval(loop);
      if (glanceTimer) window.clearTimeout(glanceTimer);
    };
  }, [isSleeping, reducedMotion]);

  return {
    behavior: (isSleeping
      ? "sleep"
      : reducedMotion
        ? "static"
        : pulse) as AibaBehavior,
    isSleeping,
  };
}
