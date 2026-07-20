const { globalShortcut } = require("electron");

let registered = false;

function registerShortcuts(mainWindow, shortcuts = {}) {
  unregisterShortcuts();

  const entries = [
    { key: shortcuts.toggleWidget || "CommandOrControl+Shift+A", action: "toggle-widget" },
    { key: shortcuts.toggleSession || "CommandOrControl+Shift+F", action: "toggle-session" },
  ];

  for (const entry of entries) {
    try {
      const ok = globalShortcut.register(entry.key, () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        if (entry.action === "toggle-widget") {
          if (mainWindow.isVisible()) mainWindow.hide();
          else {
            mainWindow.show();
            mainWindow.focus();
          }
          return;
        }
        mainWindow.webContents.send("shortcut-fired", { action: entry.action });
      });
      if (ok) registered = true;
    } catch (error) {
      console.warn(`Could not register shortcut ${entry.key}:`, error.message);
    }
  }
}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
  registered = false;
}

function isRegistered() {
  return registered;
}

module.exports = {
  registerShortcuts,
  unregisterShortcuts,
  isRegistered,
};
