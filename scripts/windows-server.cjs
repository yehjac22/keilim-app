const fs = require("node:fs");
const path = require("node:path");

const candidateAppDirs = [
  path.join(path.dirname(process.execPath), "app"),
  path.join(process.cwd(), "app"),
  path.join(process.cwd(), "dist", "windows", "app"),
];

const appDir = candidateAppDirs.find((candidatePath) => fs.existsSync(path.join(candidatePath, ".next")));

if (!appDir) {
  console.error("Missing app/.next build output next to the executable.");
  console.error("Run npm run build:exe and copy the full dist/windows folder to Windows.");
  process.exit(1);
}

process.chdir(appDir);
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.env.PORT = process.env.PORT || "3001";

console.log(`Keilim server starting on http://${process.env.HOSTNAME}:${process.env.PORT}`);
console.log("LAN access: use this machine's IP address with port 3001.");

process.argv = [
  process.execPath,
  "next",
  "start",
  "--hostname",
  process.env.HOSTNAME,
  "--port",
  process.env.PORT,
];

require("next/dist/bin/next");
