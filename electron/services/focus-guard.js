const { app } = require("electron");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const { sanitizeSites, START_MARKER } = require("./guard-utils");

let guardState = {
  active: false,
  helperRunning: false,
  notificationsMuted: false,
  sitesBlocked: false,
  message: "Guard idle",
};

let lastAppliedSitesKey = "";

function getHostsPath() {
  return path.join(
    process.env.SystemRoot || "C:\\Windows",
    "System32",
    "drivers",
    "etc",
    "hosts",
  );
}

function hostsHasGuardBlock() {
  try {
    return fs.readFileSync(getHostsPath(), "utf8").includes(START_MARKER);
  } catch {
    return false;
  }
}

function refreshSitesBlockedFromHosts() {
  const active = hostsHasGuardBlock();
  guardState.sitesBlocked = active;
  return active;
}

function resetGuardState() {
  guardState = {
    active: false,
    helperRunning: false,
    notificationsMuted: false,
    sitesBlocked: hostsHasGuardBlock(),
    message: "Guard idle",
  };
  lastAppliedSitesKey = "";
}

function openFocusAssist() {
  return new Promise((resolve) => {
    execFile(
      "cmd",
      ["/c", "start", "", "ms-settings:notifications"],
      { windowsHide: true },
      (error) => resolve(!error),
    );
  });
}

function runHelper(action, blockedSites = []) {
  return new Promise((resolve) => {
    const sites = sanitizeSites(blockedSites);
    const script = path.join(__dirname, "..", "helper", "guard-helper.ps1");
    const statusPath = path.join(app.getPath("userData"), "guard-status.json");

    try {
      fs.rmSync(statusPath, { force: true });
    } catch {
      // leftover status file is fine to ignore
    }

    execFile(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script,
        "-Action",
        action,
        "-Sites",
        sites.join(","),
        "-StatusPath",
        statusPath,
      ],
      { windowsHide: true, timeout: 120000 },
      (error) => {
        let status = null;
        try {
          status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
        } catch {
          status = null;
        }

        if (error || !status?.success) {
          resolve({
            success: false,
            active: false,
            sites: [],
            message:
              status?.message ||
              "Site blocker was not applied. Basic guard remains available.",
          });
          return;
        }
        resolve(status);
      },
    );
  });
}

async function setFocusGuard({ enabled }) {
  if (!enabled) {
    guardState.active = false;
    guardState.message = "Guard idle";
    return getGuardStatus();
  }

  guardState.active = true;
  guardState.notificationsMuted = false;
  guardState.message =
    "Focus guard is on. Turn on Windows Focus to silence notifications.";
  return getGuardStatus();
}

async function applySiteBlock(blockedSites = []) {
  const sites = sanitizeSites(blockedSites);
  if (!sites.length) {
    guardState.message = "Add at least one domain before applying site block.";
    return getGuardStatus();
  }

  const sitesKey = sites.join(",");
  if (refreshSitesBlockedFromHosts() && sitesKey === lastAppliedSitesKey) {
    return getGuardStatus();
  }

  const result = await runHelper("apply", sites);
  guardState.helperRunning = false;
  refreshSitesBlockedFromHosts();
  guardState.message = result.message;
  if (result.success && result.active) {
    lastAppliedSitesKey = sitesKey;
    guardState.sitesBlocked = true;
  }
  return getGuardStatus();
}

async function removeSiteBlock() {
  // Always attempt cleanup when the hosts marker is present — in-memory state
  // is lost on restart and must not leave sites blocked.
  if (!hostsHasGuardBlock() && !guardState.sitesBlocked) {
    lastAppliedSitesKey = "";
    guardState.sitesBlocked = false;
    return getGuardStatus();
  }

  const result = await runHelper("remove", []);
  guardState.helperRunning = false;
  lastAppliedSitesKey = "";
  refreshSitesBlockedFromHosts();

  if (!result.success || hostsHasGuardBlock()) {
    guardState.sitesBlocked = hostsHasGuardBlock();
    guardState.message =
      "Site-block cleanup needs administrator approval.";
  } else {
    guardState.sitesBlocked = false;
    guardState.message = "Site block removed.";
  }
  return getGuardStatus();
}

/** Clear leftover hosts edits (startup / quit safety net). */
async function ensureSiteBlockCleared() {
  if (!hostsHasGuardBlock()) {
    guardState.sitesBlocked = false;
    lastAppliedSitesKey = "";
    return getGuardStatus();
  }
  return removeSiteBlock();
}

function getGuardStatus() {
  refreshSitesBlockedFromHosts();
  return { ...guardState };
}

module.exports = {
  setFocusGuard,
  applySiteBlock,
  removeSiteBlock,
  ensureSiteBlockCleared,
  getGuardStatus,
  openFocusAssist,
  resetGuardState,
  hostsHasGuardBlock,
  sanitizeSites,
};
