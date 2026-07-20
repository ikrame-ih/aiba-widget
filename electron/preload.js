const { contextBridge, ipcRenderer } = require("electron");
// Preload can't import local modules under sandbox, so the channel
// names are duplicated here. Keep them in sync with electron/src-bridge/ipc-channels.js.
const IPC = {
  OPEN_EXTERNAL: "open-external",
  SHOW_NOTIFICATION: "show-notification",
  LOAD_DATA: "load-data",
  SAVE_DATA: "save-data",
  OPEN_HELP_WINDOW: "open-help-window",
  CLOSE_WINDOW: "close-window",
  SET_WIDGET_MODE: "set-widget-mode",
  GET_WIDGET_MODE: "get-widget-mode",
  GET_WIDGET_MODE_SYNC: "get-widget-mode-sync",
  WIDGET_MODE_CHANGED: "widget-mode-changed",
  SHORTCUT_FIRED: "shortcut-fired",
  SET_TUNNEL_VISION: "set-tunnel-vision",
  SET_FOCUS_GUARD: "set-focus-guard",
  APPLY_SITE_BLOCK: "apply-site-block",
  REMOVE_SITE_BLOCK: "remove-site-block",
  GET_GUARD_STATUS: "get-guard-status",
  OPEN_FOCUS_ASSIST: "open-focus-assist",
};

contextBridge.exposeInMainWorld("api", {
  initialWidgetMode: ipcRenderer.sendSync(IPC.GET_WIDGET_MODE_SYNC),
  isSmokeTest: process.env.AIBA_SMOKE === "1",
  openExternal: (url) => ipcRenderer.send(IPC.OPEN_EXTERNAL, url),
  showNotification: (title, body) =>
    ipcRenderer.send(IPC.SHOW_NOTIFICATION, { title, body }),
  loadData: () => ipcRenderer.invoke(IPC.LOAD_DATA),
  saveData: (data) => ipcRenderer.invoke(IPC.SAVE_DATA, data),
  openHelpWindow: (locale) => ipcRenderer.send(IPC.OPEN_HELP_WINDOW, locale),
  closeWindow: () => ipcRenderer.send(IPC.CLOSE_WINDOW),
  setWidgetMode: (mode) => ipcRenderer.invoke(IPC.SET_WIDGET_MODE, mode),
  getWidgetMode: () => ipcRenderer.invoke(IPC.GET_WIDGET_MODE),
  onWidgetModeChanged: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on(IPC.WIDGET_MODE_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC.WIDGET_MODE_CHANGED, listener);
  },
  setTunnelVision: (enabled) => ipcRenderer.invoke(IPC.SET_TUNNEL_VISION, enabled),
  setFocusGuard: (payload) => ipcRenderer.invoke(IPC.SET_FOCUS_GUARD, payload),
  applySiteBlock: (payload) => ipcRenderer.invoke(IPC.APPLY_SITE_BLOCK, payload),
  removeSiteBlock: () => ipcRenderer.invoke(IPC.REMOVE_SITE_BLOCK),
  getGuardStatus: () => ipcRenderer.invoke(IPC.GET_GUARD_STATUS),
  openFocusAssist: () => ipcRenderer.invoke(IPC.OPEN_FOCUS_ASSIST),
  onShortcut: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on(IPC.SHORTCUT_FIRED, listener);
    return () => ipcRenderer.removeListener(IPC.SHORTCUT_FIRED, listener);
  },
});
