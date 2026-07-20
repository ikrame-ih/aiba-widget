import type { CopyShape } from "../../../shared/copy.d.ts";
import type { GuardStatus } from "../types/app";

export function guardBannerText(status: GuardStatus, copy: CopyShape): string {
  if (status.sitesBlocked) {
    return copy.guard.sitesBlocked;
  }
  if (status.message.includes("administrator") || status.message.includes("administrador")) {
    return copy.guard.cleanup;
  }
  if (status.message.includes("not applied") || status.message.includes("no se aplicó")) {
    return copy.guard.blockerFailed;
  }
  if (status.active) {
    return copy.guard.active;
  }
  if (status.helperRunning) {
    return copy.guard.helperRunning;
  }
  return "";
}
