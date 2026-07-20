const {
  app,
  ipcMain,
  shell,
  Tray,
  Menu,
  Notification,
  BrowserWindow,
  screen,
} = require("electron");
const fs = require("fs");
const path = require("path");
const { loadData, saveData } = require("./services/storage");
const {
  createMainWindow,
  createHelpWindow,
  setWidgetMode,
  WIDGET_SIZES,
  reclampWindow,
} = require("./services/windows");
const { IPC } = require("./src-bridge/ipc-channels");
const {
  registerShortcuts,
  unregisterShortcuts,
  isRegistered: areShortcutsRegistered,
} = require("./services/global-shortcuts");
const {
  showTunnelVision,
  hideTunnelVision,
  isActive: isTunnelVisionActive,
} = require("./services/focus-overlay");
const {
  setFocusGuard,
  applySiteBlock,
  removeSiteBlock,
  getGuardStatus,
  openFocusAssist,
  resetGuardState,
} = require("./services/focus-guard");

let mainWindow = null;
let helpWindow = null;
let tray = null;
let currentWidgetMode = "compact";
let cleanupBeforeQuitComplete = false;

function isAllowedExternalUrl(url) {
  return (
    typeof url === "string" &&
    (url.startsWith("https://") || url.startsWith("http://"))
  );
}

function applyWidgetMode(mode, notify = true) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { mode: currentWidgetMode, bounds: null };
  }
  currentWidgetMode = mode === "expanded" ? "expanded" : "compact";
  const result = setWidgetMode(mainWindow, currentWidgetMode);
  if (notify && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send(IPC.WIDGET_MODE_CHANGED, result);
  }
  return result;
}

function registerIpcHandlers() {
  ipcMain.handle(IPC.LOAD_DATA, async () => loadData());

  ipcMain.handle(IPC.SAVE_DATA, async (_event, data) => {
    if (!data || typeof data !== "object") return false;
    return saveData(data);
  });

  ipcMain.on(IPC.OPEN_EXTERNAL, (_event, url) => {
    if (isAllowedExternalUrl(url)) shell.openExternal(url);
  });

  ipcMain.on(IPC.SHOW_NOTIFICATION, (_event, payload) => {
    if (!Notification.isSupported() || !payload || typeof payload !== "object")
      return;
    new Notification({
      title: String(payload.title || "Aiba").slice(0, 80),
      body: String(payload.body || "").slice(0, 500),
    }).show();
  });

  ipcMain.on(IPC.OPEN_HELP_WINDOW, (_event, locale) => {
    if (!mainWindow) return;
    if (helpWindow) {
      helpWindow.focus();
      return;
    }
    helpWindow = createHelpWindow(mainWindow, locale);
    helpWindow.on("closed", () => {
      helpWindow = null;
    });
  });

  ipcMain.on(IPC.CLOSE_WINDOW, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window === mainWindow) window.hide();
    else if (window) window.close();
  });

  ipcMain.handle(IPC.SET_WIDGET_MODE, (_event, mode) => {
    return applyWidgetMode(mode, true);
  });

  ipcMain.handle(IPC.GET_WIDGET_MODE, () => ({
    mode: currentWidgetMode,
    bounds:
      mainWindow && !mainWindow.isDestroyed() ? mainWindow.getBounds() : null,
  }));

  ipcMain.on(IPC.GET_WIDGET_MODE_SYNC, (event) => {
    event.returnValue = {
      mode: currentWidgetMode,
      bounds:
        mainWindow && !mainWindow.isDestroyed() ? mainWindow.getBounds() : null,
    };
  });

  ipcMain.handle(IPC.SET_TUNNEL_VISION, (_event, enabled) => {
    if (!mainWindow) return false;
    if (Boolean(enabled)) showTunnelVision(mainWindow);
    else hideTunnelVision(mainWindow);
    return true;
  });

  ipcMain.handle(IPC.SET_FOCUS_GUARD, async (_event, payload) => {
    const input = payload && typeof payload === "object" ? payload : {};
    return setFocusGuard({ enabled: Boolean(input.enabled) });
  });

  ipcMain.handle(IPC.APPLY_SITE_BLOCK, async (_event, payload) => {
    const input = payload && typeof payload === "object" ? payload : {};
    const blockedSites = Array.isArray(input.blockedSites)
      ? input.blockedSites.filter((site) => typeof site === "string")
      : [];
    return applySiteBlock(blockedSites);
  });

  ipcMain.handle(IPC.REMOVE_SITE_BLOCK, async () => removeSiteBlock());

  ipcMain.handle(IPC.GET_GUARD_STATUS, () => getGuardStatus());

  ipcMain.handle(IPC.OPEN_FOCUS_ASSIST, async () => openFocusAssist());
}

function createTray() {
  const iconPath = path.join(__dirname, "..", "src", "assets", "icon.png");
  tray = new Tray(iconPath);
  const menu = Menu.buildFromTemplate([
    {
      label: "Show / Hide",
      click: () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) mainWindow.hide();
        else mainWindow.show();
      },
    },
    {
      label: "Compact",
      click: () => {
        applyWidgetMode("compact", true);
      },
    },
    {
      label: "Expanded",
      click: () => {
        applyWidgetMode("expanded", true);
      },
    },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("Aiba");
  tray.setContextMenu(menu);
  tray.on("double-click", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });
}

async function runElectronSmoke(initialMode) {
  const assertMode = (mode) => {
    const expected = WIDGET_SIZES[mode];
    const actual = mainWindow.getContentBounds();
    if (actual.width !== expected.width || actual.height !== expected.height) {
      throw new Error(
        `${mode} content bounds were ${actual.width}x${actual.height}, expected ${expected.width}x${expected.height}`,
      );
    }
  };

  try {
    assertMode(initialMode);
    const otherMode = initialMode === "compact" ? "expanded" : "compact";
    applyWidgetMode(otherMode, false);
    assertMode(otherMode);
    applyWidgetMode(initialMode, false);
    assertMode(initialMode);
    if (!tray || tray.isDestroyed()) throw new Error("Tray was not created");
    if (!areShortcutsRegistered()) {
      throw new Error("No global shortcut could be registered");
    }
    let rendererReady = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      rendererReady = await mainWindow.webContents.executeJavaScript(
        `Boolean(document.querySelector(".widget--${initialMode}"))`,
      );
      if (rendererReady) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!rendererReady) {
      const diagnostics = await mainWindow.webContents.executeJavaScript(`({
        initialMode: window.api?.initialWidgetMode ?? null,
        widgetClass: document.querySelector(".widget")?.className ?? null,
        bodyText: document.body.innerText.slice(0, 120)
      })`);
      throw new Error(
        `Renderer did not synchronize to ${initialMode}: ${JSON.stringify(diagnostics)}`,
      );
    }
    const dragContract = await mainWindow.webContents.executeJavaScript(`({
      rails: [...document.querySelectorAll(".drag-rail")].filter(
        (rail) => getComputedStyle(rail).webkitAppRegion === "drag"
      ).length,
      controls: [...document.querySelectorAll("button, input, textarea, select")].every(
        (control) => getComputedStyle(control).webkitAppRegion === "no-drag"
      )
    })`);
    if (dragContract.rails !== 4 || !dragContract.controls) {
      throw new Error(`Drag contract failed: ${JSON.stringify(dragContract)}`);
    }

    const uiContract = await mainWindow.webContents.executeJavaScript(`({
      studioShell: Boolean(document.querySelector(".studio-shell")),
      studioSidebar: Boolean(document.querySelector(".studio-sidebar")),
      coreIntent: Boolean(document.querySelector(".core-intent") || document.querySelector(".panel")),
      compactFocus: Boolean(document.querySelector(".compact-focus")),
      compactExpand: Boolean(document.querySelector(".compact-focus__expand")),
      theme: document.querySelector(".app-shell")?.dataset.theme ?? null,
      timeMode: document.querySelector(".widget")?.dataset.timeMode ?? null,
      phaseBridge: Boolean(document.querySelector(".phase-bridge"))
    })`);
    if (!uiContract.timeMode) {
      throw new Error(
        `Circadian UI contract failed: ${JSON.stringify(uiContract)}`,
      );
    }
    if (
      initialMode === "expanded" &&
      (!uiContract.studioShell ||
        !uiContract.coreIntent)
    ) {
      throw new Error(
        `Expanded studio layout missing: ${JSON.stringify(uiContract)}`,
      );
    }
    if (
      initialMode === "compact" &&
      (!uiContract.compactFocus || !uiContract.compactExpand)
    ) {
      throw new Error(
        `Compact layout contract failed: ${JSON.stringify(uiContract)}`,
      );
    }
    if (uiContract.theme !== "dark") {
      throw new Error(
        `Expected dark theme by default, got ${uiContract.theme}`,
      );
    }

    for (const mode of ["morning", "afternoon", "evening"]) {
      await mainWindow.webContents.executeJavaScript(`
        document.querySelector(".studio-phase-nav__item--${mode}")?.click();
      `);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const activeMode = await mainWindow.webContents.executeJavaScript(
        `document.querySelector(".widget")?.dataset.timeMode ?? null`,
      );
      if (activeMode !== mode) {
        throw new Error(
          `Preview mode ${mode} did not apply (got ${activeMode})`,
        );
      }
      if (process.env.AIBA_SMOKE_CAPTURE) {
        const baseCapture = process.env.AIBA_SMOKE_CAPTURE;
        const capturePath = baseCapture.includes("-morning.png")
          ? baseCapture
          : path.join(
              path.dirname(baseCapture),
              `${initialMode}-${mode}${path.extname(baseCapture) || ".png"}`,
            );
        await new Promise((resolve) => setTimeout(resolve, 250));
        const image = await mainWindow.webContents.capturePage();
        fs.writeFileSync(capturePath, image.toPNG());
      }
    }

    await mainWindow.webContents.executeJavaScript(`
      document.querySelector(".studio-phase-nav__item--afternoon")?.click();
    `);
    await new Promise((resolve) => setTimeout(resolve, 150));

    let focusReady = false;
    const focusSelector =
      initialMode === "expanded" ? ".focus-studio-view, .today-studio" : ".focus-arc-timer";
    for (let attempt = 0; attempt < 40; attempt += 1) {
      focusReady = await mainWindow.webContents.executeJavaScript(
        `Boolean(document.querySelector("${focusSelector}"))`,
      );
      if (focusReady) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!focusReady) {
      throw new Error(
        `Focus indicator missing (${focusSelector}) during smoke`,
      );
    }

    if (
      process.env.AIBA_SMOKE_CAPTURE &&
      !String(process.env.AIBA_SMOKE_CAPTURE).includes("-morning")
    ) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const image = await mainWindow.webContents.capturePage();
      fs.writeFileSync(process.env.AIBA_SMOKE_CAPTURE, image.toPNG());
    }
    console.log(`AIBA_ELECTRON_SMOKE_OK:${initialMode}`);
    cleanupBeforeQuitComplete = true;
    app.exit(0);
  } catch (error) {
    console.error(`AIBA_ELECTRON_SMOKE_FAILED:${error.message}`);
    cleanupBeforeQuitComplete = true;
    app.exit(1);
  }
}

app.whenReady().then(() => {
  const saved = loadData();
  currentWidgetMode =
    process.env.AIBA_SMOKE_MODE === "expanded" ||
    (!process.env.AIBA_SMOKE_MODE && saved?.widgetMode === "expanded")
      ? "expanded"
      : "compact";
  registerIpcHandlers();
  mainWindow = createMainWindow(currentWidgetMode);
  registerShortcuts(mainWindow);
  createTray();
  const handleDisplayChange = () => {
    reclampWindow(mainWindow);
    if (isTunnelVisionActive()) showTunnelVision(mainWindow);
  };
  screen.on("display-metrics-changed", handleDisplayChange);
  screen.on("display-added", handleDisplayChange);
  screen.on("display-removed", handleDisplayChange);

  if (process.env.AIBA_SMOKE) {
    mainWindow.webContents.once("did-finish-load", () => {
      void runElectronSmoke(currentWidgetMode);
    });
    mainWindow.webContents.once(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        console.error(
          `AIBA_ELECTRON_SMOKE_FAILED:${errorCode}:${errorDescription}`,
        );
        cleanupBeforeQuitComplete = true;
        app.exit(1);
      },
    );
  }
});

app.on("before-quit", (event) => {
  if (cleanupBeforeQuitComplete) return;
  event.preventDefault();
  Promise.all([
    removeSiteBlock(),
    setFocusGuard({ enabled: false }),
    Promise.resolve(hideTunnelVision(mainWindow)),
  ]).finally(() => {
    cleanupBeforeQuitComplete = true;
    app.quit();
  });
});

app.on("will-quit", () => {
  unregisterShortcuts();
  resetGuardState();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

module.exports = { WIDGET_SIZES };
