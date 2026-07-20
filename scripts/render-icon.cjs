/**
 * Resizes src/assets/favicon.png → src/assets/icon.png (256×256) for Electron tray/window.
 * Usage: node scripts/render-icon.cjs
 *
 * Favicon source of truth: drop/replace src/assets/favicon.png, then run this script.
 * Uses Windows System.Drawing (no Electron offscreen capture).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const faviconPath = path.join(root, "src", "assets", "favicon.png");
const outPath = path.join(root, "src", "assets", "icon.png");

if (!fs.existsSync(faviconPath)) {
  console.error(`Missing ${faviconPath}`);
  process.exitCode = 1;
  process.exit();
}

const ps = `
Add-Type -AssemblyName System.Drawing
$srcPath = ${JSON.stringify(faviconPath)}
$outPath = ${JSON.stringify(outPath)}
$src = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, 0, 0, 256, 256)
$g.Dispose()
$src.Dispose()
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "ICON_OK:$outPath"
`;

const result = spawnSync(
  "powershell.exe",
  ["-NoProfile", "-NonInteractive", "-Command", ps],
  { encoding: "utf8" },
);

const out = `${result.stdout || ""}${result.stderr || ""}`;
process.stdout.write(result.stdout || "");
if (result.stderr) process.stderr.write(result.stderr);

if (result.status !== 0 || !out.includes("ICON_OK") || !fs.existsSync(outPath)) {
  console.error("Icon render failed");
  process.exitCode = 1;
}
