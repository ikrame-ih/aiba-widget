/**
 * Resizes src/assets/favicon.png → src/assets/icon.png (256×256) for Electron tray/window.
 * Usage: node scripts/render-icon.cjs
 *
 * Favicon source of truth: drop/replace src/assets/favicon.png, then run this script.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const electronPath = require("electron");

const root = path.resolve(__dirname, "..");
const faviconPath = path.join(root, "src", "assets", "favicon.png");
const outPath = path.join(root, "src", "assets", "icon.png");
const runnerPath = path.join(root, "scripts", "_render-icon-runner.cjs");

if (!fs.existsSync(faviconPath)) {
  console.error(`Missing ${faviconPath}`);
  process.exitCode = 1;
  process.exit();
}

const runner = `
const { app, BrowserWindow } = require("electron");
const fs = require("fs");

const faviconPath = ${JSON.stringify(faviconPath)};
const outPath = ${JSON.stringify(outPath)};

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 256,
    height: 256,
    show: false,
    frame: false,
    backgroundColor: "#2a2424",
    webPreferences: { offscreen: true },
  });

  const html = \`<!doctype html><html><body style="margin:0;background:#2a2424;overflow:hidden;width:256px;height:256px">
    <img src="file:///\${faviconPath.replace(/\\\\/g, "/")}" width="256" height="256" alt="" style="display:block;width:256px;height:256px;object-fit:cover" />
  </body></html>\`;

  await win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  await new Promise((r) => setTimeout(r, 250));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 256, height: 256 });
  fs.writeFileSync(outPath, image.toPNG());
  console.log("ICON_OK:" + outPath);
  app.exit(0);
});

app.on("window-all-closed", (e) => e.preventDefault());
`;

fs.writeFileSync(runnerPath, runner);

const child = spawn(electronPath, [runnerPath], {
  cwd: root,
  env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: "true" },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});

let out = "";
child.stdout.on("data", (c) => {
  out += c.toString();
  process.stdout.write(c);
});
child.stderr.on("data", (c) => {
  out += c.toString();
  process.stderr.write(c);
});
child.on("exit", (code) => {
  try {
    fs.unlinkSync(runnerPath);
  } catch {
    /* ignore */
  }
  if (code !== 0 || !out.includes("ICON_OK")) {
    console.error("Icon render failed");
    process.exitCode = 1;
  }
});
