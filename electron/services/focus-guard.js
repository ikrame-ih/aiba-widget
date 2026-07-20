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

function resetGuardState() {
  guardState = {
    active: false,
    helperRunning: false,
    notificationsMuted: false,
    sitesBlocked: false,
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
  if (guardState.sitesBlocked && sitesKey === lastAppliedSitesKey) {
    return getGuardStatus();
  }

  const result = await runHelper("apply", sites);
  guardState.helperRunning = false;
  guardState.sitesBlocked = result.success && result.active;
  guardState.message = result.message;
  if (result.success && result.active) {
    lastAppliedSitesKey = sitesKey;
  }
  return getGuardStatus();
}

async function removeSiteBlock() {
  if (!guardState.sitesBlocked) {
    return getGuardStatus();
  }

  const result = await runHelper("remove", []);
  guardState.helperRunning = false;
  guardState.sitesBlocked = false;
  lastAppliedSitesKey = "";
  if (!result.success) {
    guardState.message =
      "Site-block cleanup needs administrator approval.";
  } else {
    guardState.message = "Site block removed.";
  }
  return getGuardStatus();
}

function getGuardStatus() {
  return { ...guardState };
}

module.exports = {
  setFocusGuard,
  applySiteBlock,
  removeSiteBlock,
  getGuardStatus,
  openFocusAssist,
  resetGuardState,
  sanitizeSites,
};
