import fs from "node:fs";
import path from "node:path";
import { headers } from "next/headers";

function getApkInfo() {
  const apkPath = path.join(process.cwd(), "public", "downloads", "keilim-kiosk.apk");
  if (!fs.existsSync(apkPath)) {
    return null;
  }

  const stat = fs.statSync(apkPath);
  return {
    sizeMb: (stat.size / (1024 * 1024)).toFixed(2),
    updatedAt: stat.mtime.toISOString(),
  };
}

export default async function AndroidDownloadPage() {
  const apk = getApkInfo();
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "<server-lan-ip>:3001";
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";
  const androidPageUrl = `${protocol}://${host}/android`;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 py-4 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Android APK Download</h1>

      <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Install or update the Keilim Android app over your local network. Keep the phone and this server on the same Wi-Fi.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Step 1: Open this page on Android</h2>
        <p className="mt-1 text-sm text-slate-700">
          On your Android device browser, go to this exact URL:
        </p>
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900">{androidPageUrl}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Step 2: Download and Install</h2>
        {apk ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-slate-700">Current APK size: {apk.sizeMb} MB</p>
            <p className="text-sm text-slate-700">Last updated: {new Date(apk.updatedAt).toLocaleString()}</p>
            <a
              href="/downloads/keilim-kiosk.apk"
              className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Download APK
            </a>
          </div>
        ) : (
          <p className="mt-2 text-sm text-amber-700">
            APK not found yet. Build it with: <span className="font-mono">npm run android:build</span>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Step 3: Allow App Updates</h2>
        <p className="mt-1 text-sm text-slate-700">
          First install may require enabling "Install unknown apps" for your browser. Future LAN updates install from the same URL and APK file.
        </p>
      </div>
    </section>
  );
}
