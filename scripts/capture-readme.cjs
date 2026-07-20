/**
 * Launches Electron to capture real README screenshots into docs/images/
 * via webContents.capturePage(). Demo data is seeded inside Electron.
 *
 * Captures dark + light suites (compact, plan, focus, unwind, preferences, ask-aiba).
 * Usage: npm run capture:readme
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const electronPath = require("electron");

const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "docs", "images");

function runCapture() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outDir, { recursive: true });
    for (const file of fs.readdirSync(outDir)) {
      if (file.endsWith(".png")) fs.unlinkSync(path.join(outDir, file));
    }

    const child = spawn(electronPath, [projectRoot], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AIBA_README_CAPTURE: outDir,
        ELECTRON_DISABLE_SECURITY_WARNINGS: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let output = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("README capture timed out"));
    }, 90_000);

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0 && output.includes("AIBA_README_CAPTURE_OK")) {
        resolve();
        return;
      }
      reject(
        new Error(`README capture failed with code ${code}\n${output.trim()}`),
      );
    });
  });
}

async function main() {
  await runCapture();
  console.log(`Real screenshots saved under ${outDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
