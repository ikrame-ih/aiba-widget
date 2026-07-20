const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const dataPath = path.join(app.getPath("userData"), "data.json");
const backupPath = `${dataPath}.bak`;

function loadData() {
  try {
    for (const candidate of [dataPath, backupPath]) {
      if (fs.existsSync(candidate)) {
        try {
          return JSON.parse(fs.readFileSync(candidate, "utf8"));
        } catch {
          // Try the backup before returning an empty state.
        }
      }
    }
  } catch (error) {
    console.error("Failed to read data file:", error);
  }
  return null;
}

function saveData(data) {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const serialized = JSON.stringify(data, null, 2);
    if (Buffer.byteLength(serialized, "utf8") > 1024 * 1024) return false;
    const tempPath = `${dataPath}.tmp`;
    if (fs.existsSync(dataPath)) {
      try {
        JSON.parse(fs.readFileSync(dataPath, "utf8"));
        fs.copyFileSync(dataPath, backupPath);
      } catch {
        // Preserve the last known-good backup when the primary is corrupt.
      }
    }
    fs.writeFileSync(tempPath, serialized, "utf8");
    fs.copyFileSync(tempPath, dataPath);
    fs.rmSync(tempPath, { force: true });
    return true;
  } catch (error) {
    console.error("Failed to write data file:", error);
    return false;
  }
}

module.exports = {
  dataPath,
  loadData,
  saveData,
};
