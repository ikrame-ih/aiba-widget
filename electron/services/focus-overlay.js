const { BrowserWindow, screen } = require("electron");

/** @type {BrowserWindow[]} */
let overlayWindows = [];

function createOverlayWindow(display) {
  const { x, y, width, height } = display.bounds;
  const overlay = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    movable: false,
    hasShadow: false,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  overlay.setIgnoreMouseEvents(true);
  overlay.setAlwaysOnTop(true, "screen-saver");
  overlay.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(`
      <!doctype html>
      <html><head><style>
        html,body{margin:0;width:100%;height:100%;background:rgba(15,12,10,0.62);pointer-events:none}
      </style></head><body></body></html>
    `)}`,
  );

  return overlay;
}

function showTunnelVision(mainWindow) {
  hideTunnelVision();
  const displays = screen.getAllDisplays();
  for (const display of displays) {
    overlayWindows.push(createOverlayWindow(display));
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    mainWindow.show();
    mainWindow.focus();
  }
}

function hideTunnelVision(mainWindow) {
  for (const overlay of overlayWindows) {
    if (!overlay.isDestroyed()) overlay.close();
  }
  overlayWindows = [];
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(true);
  }
}

function isActive() {
  return overlayWindows.some((w) => !w.isDestroyed());
}

module.exports = {
  showTunnelVision,
  hideTunnelVision,
  isActive,
};
