const fs = require("node:fs/promises");
const path = require("node:path");

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(fromPath, toPath) {
  if (!(await exists(fromPath))) {
    return;
  }

  await fs.cp(fromPath, toPath, { recursive: true });
}

async function main() {
  const root = process.cwd();
  const outRoot = path.join(root, "dist", "windows");
  const appOut = path.join(outRoot, "app");

  await fs.rm(outRoot, { recursive: true, force: true });
  await fs.mkdir(appOut, { recursive: true });

  await copyIfExists(path.join(root, ".next"), path.join(appOut, ".next"));
  await copyIfExists(path.join(root, "public"), path.join(appOut, "public"));
  await copyIfExists(path.join(root, "data"), path.join(appOut, "data"));
  await copyIfExists(path.join(root, ".env.local"), path.join(appOut, ".env.local"));
  await copyIfExists(path.join(root, "next.config.ts"), path.join(appOut, "next.config.ts"));

  const readme = [
    "Keilim Windows Bundle",
    "",
    "1. Keep keilim-server.exe and app/ in the same dist/windows folder.",
    "2. Run keilim-server.exe to host the site.",
    "3. Open http://<this-machine-ip>:3001 from other devices on the same network.",
  ].join("\n");

  await fs.writeFile(path.join(outRoot, "README.txt"), readme, "utf8");
  console.log("Prepared Windows bundle at dist/windows");
}

main().catch((error) => {
  console.error("Failed to prepare Windows bundle", error);
  process.exitCode = 1;
});
