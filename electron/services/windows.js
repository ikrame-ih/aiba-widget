const { BrowserWindow, screen } = require("electron");
const path = require("path");
const { clampBounds, calculateModeBounds } = require("./window-bounds");

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

const WIDGET_SIZES = {
  compact: { width: 400, height: 480 },
  expanded: { width: 900, height: 720 },
};

function getPreloadPath() {
  return path.join(__dirname, "..", "preload.js");
}

function getMainPageTarget() {
  if (isDev) {
    return `${process.env.VITE_DEV_SERVER_URL}/windows/main/index.html`;
  }
  return path.join(__dirname, "..", "..", "dist", "windows", "main", "index.html");
}

function getHelpPageTarget() {
  if (isDev) {
    return `${process.env.VITE_DEV_SERVER_URL}/windows/help/help.html`;
  }
  return path.join(__dirname, "..", "..", "dist", "windows", "help", "help.html");
}

function clampToDisplay(bounds, size, displayOverride) {
  const display = displayOverride || screen.getDisplayMatching(bounds);
  return clampBounds(bounds, size, display.workArea);
}

function createMainWindow(initialMode = "compact") {
  const size = WIDGET_SIZES[initialMode] || WIDGET_SIZES.compact;
  const window = new BrowserWindow({
    width: size.width,
    height: size.height,
    useContentSize: true,
    center: true,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    icon: path.join(__dirname, "..", "..", "src", "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  });

  const target = getMainPageTarget();
  if (isDev) {
    window.loadURL(target);
  } else {
    window.loadFile(target);
  }

  window.once("ready-to-show", () => window.show());
  return window;
}

function setWidgetMode(window, mode = "compact") {
  if (!window || window.isDestroyed()) return WIDGET_SIZES.compact;
  const next = WIDGET_SIZES[mode] || WIDGET_SIZES.compact;
  const bounds = window.getBounds();
  const display = screen.getDisplayMatching(bounds);
  const nextBounds = calculateModeBounds(bounds, next, display.workArea);

  window.setBounds(nextBounds, false);
  return { mode: WIDGET_SIZES[mode] ? mode : "compact", bounds: window.getBounds() };
}

function reclampWindow(window) {
  if (!window || window.isDestroyed()) return null;
  const bounds = window.getBounds();
  const display = screen.getDisplayMatching(bounds);
  const clamped = clampToDisplay(bounds, bounds, display);
  window.setBounds(clamped, false);
  return clamped;
}

function createHelpWindow(parentWindow, locale = "en") {
  const bounds = parentWindow.getBounds();
  const workArea = screen.getDisplayMatching(bounds).workArea;
  const helpWidth = 340;
  const helpHeight = 520;
  const preferredX = bounds.x - helpWidth - 20;
  const x = Math.max(workArea.x, Math.min(preferredX, workArea.x + workArea.width - helpWidth));
  const y = Math.max(workArea.y, Math.min(bounds.y + 40, workArea.y + workArea.height - helpHeight));

  const window = new BrowserWindow({
    width: helpWidth,
    height: helpHeight,
    x,
    y,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    parent: parentWindow,
    show: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  });

  const helpTarget = getHelpPageTarget();
  const lang = typeof locale === "string" && locale === "es" ? "es" : "en";
  if (isDev) {
    window.loadURL(`${helpTarget}?lang=${lang}`);
  } else {
    window.loadFile(helpTarget, { query: { lang } });
  }

  window.once("ready-to-show", () => window.show());
  return window;
}

module.exports = {
  isDev,
  WIDGET_SIZES,
  createMainWindow,
  createHelpWindow,
  setWidgetMode,
  reclampWindow,
};
