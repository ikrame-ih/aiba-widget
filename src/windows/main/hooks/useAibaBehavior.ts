import type { SessionStatus, TimeMode } from "../types/app";

export type AibaBehavior = "static" | "sleep";

interface UseAibaBehaviorOptions {
  timeMode: TimeMode;
  sessionStatus: SessionStatus;
}

export function useAibaBehavior({ timeMode, sessionStatus }: UseAibaBehaviorOptions) {
  const isSleeping = timeMode === "evening" && sessionStatus === "idle";

  return {
    behavior: (isSleeping ? "sleep" : "static") as AibaBehavior,
    isSleeping,
  };
}
