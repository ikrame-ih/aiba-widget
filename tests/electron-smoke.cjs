const { spawn } = require("child_process");
const path = require("path");
const electronPath = require("electron");

const projectRoot = path.resolve(__dirname, "..");

function runMode(mode) {
  return new Promise((resolve, reject) => {
    const captureDir = path.join(projectRoot, "tests", ".artifacts");
    const capturePath = path.join(captureDir, `electron-${mode}.png`);
    if (process.env.AIBA_CAPTURE_SMOKE) {
      require("fs").mkdirSync(captureDir, { recursive: true });
    }
    const child = spawn(electronPath, [projectRoot], {
      cwd: projectRoot,
      env: {
        ...process.env,
        AIBA_SMOKE: "1",
        AIBA_SMOKE_MODE: mode,
        AIBA_SMOKE_CAPTURE: process.env.AIBA_CAPTURE_SMOKE ? capturePath : "",
        ELECTRON_DISABLE_SECURITY_WARNINGS: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let output = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Electron ${mode} smoke test timed out`));
    }, 30_000);

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      clearTimeout(timeout);
      const sentinel = `AIBA_ELECTRON_SMOKE_OK:${mode}`;
      if (code === 0 && output.includes(sentinel)) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Electron ${mode} smoke failed with code ${code}\n${output.trim()}`,
        ),
      );
    });
  });
}

async function main() {
  await runMode("compact");
  await runMode("expanded");
  console.log("Electron smoke tests passed for compact and expanded modes.");
  if (process.env.AIBA_CAPTURE_SMOKE) {
    console.log("Visual references saved under tests/.artifacts/");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
