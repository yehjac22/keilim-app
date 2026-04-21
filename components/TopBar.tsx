"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { UTENSILS_STORAGE_KEY } from "@/lib/utensilsClientCache";

const NAV_ITEMS = [
  { href: "/procedure", label: "Procedure" },
  { href: "/rules", label: "Basic Rules" },
  { href: "/materials", label: "Materials" },
  { href: "/halachos", label: "Halachos" },
  { href: "/lights", label: "Lights" },
  { href: "/donate", label: "Donate" },
  { href: "/android", label: "Android" },
  { href: "/contact", label: "Contact" },
];

function pillStyle(active: boolean): string {
  return `whitespace-nowrap rounded-xl px-3 py-1 text-sm ring-1 ring-slate-200 shadow-sm bg-white/70 hover:bg-white transition ${
    active ? "bg-white" : ""
  }`;
}

const REQUIRED_TAPS = 7;
const TAP_WINDOW_MS = 8000;

type UtensilsApiResponse = {
  data?: Array<unknown>;
  meta?: {
    source?: string;
    updatedAt?: string | null;
  };
};

export default function TopBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [tapCount, setTapCount] = useState(0);
  const [windowStartedAt, setWindowStartedAt] = useState<number | null>(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [onlineStatus, setOnlineStatus] = useState("unknown");

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    setOnlineStatus(navigator.onLine ? "Online" : "Offline");

    const handleOnline = () => setOnlineStatus("Online");
    const handleOffline = () => setOnlineStatus("Offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function handleMaintenanceTap() {
    const now = Date.now();
    if (!windowStartedAt || now - windowStartedAt > TAP_WINDOW_MS) {
      setWindowStartedAt(now);
      setTapCount(1);
      setStatusMessage(null);
      return;
    }

    const nextCount = tapCount + 1;
    if (nextCount >= REQUIRED_TAPS) {
      setMaintenanceOpen(true);
      setTapCount(0);
      setWindowStartedAt(null);
      setStatusMessage("Maintenance panel unlocked.");
      return;
    }

    setTapCount(nextCount);
  }

  async function handleSyncNow() {
    setIsBusy(true);
    setStatusMessage("Refreshing Google Sheets data...");

    try {
      const response = await fetch("/api/utensils?refresh=1", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Refresh failed (${response.status})`);
      }

      const parsed = (await response.json()) as UtensilsApiResponse;
      if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
        throw new Error("No data returned from API.");
      }

      localStorage.setItem(
        UTENSILS_STORAGE_KEY,
        JSON.stringify({
          items: parsed.data,
          source: parsed.meta?.source || "google-sheets",
          updatedAt: parsed.meta?.updatedAt || new Date().toISOString(),
        })
      );

      setStatusMessage("Sync complete. Reloading app...");
      window.setTimeout(() => window.location.reload(), 500);
    } catch {
      setStatusMessage("Sync failed. Check connection and API key setup.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleClearCache() {
    setIsBusy(true);

    try {
      localStorage.removeItem(UTENSILS_STORAGE_KEY);

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("keilim-")).map((key) => caches.delete(key)));
      }

      setStatusMessage("Offline cache cleared on this device.");
    } catch {
      setStatusMessage("Unable to clear offline cache.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUpdateServiceWorker() {
    setIsBusy(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setStatusMessage("No service worker registration found.");
        return;
      }

      await registration.update();
      setStatusMessage("Service worker update check complete.");
    } catch {
      setStatusMessage("Service worker update failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50">
        <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4">
        <div className="hidden py-2 sm:block">
          {!isHome && (
            <Link
              href="/"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-extrabold text-slate-800"
              aria-label="Back to home"
              title="Back to home"
            >
              ←
            </Link>
          )}
          <div className="grid grid-cols-9 items-center gap-2">
            <Link
              href="/"
              onClick={handleMaintenanceTap}
              className="justify-self-center text-xl font-extrabold tracking-tight text-slate-800"
            >
              Keilim
            </Link>
            {NAV_ITEMS.map((item, index) => {
              const active = pathname === item.href;
              const alignClass =
                index === 0
                  ? "justify-self-start"
                  : index === 1
                    ? "justify-self-center"
                    : "justify-self-end";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${alignClass} text-center whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm ring-1 ring-slate-200 shadow-sm bg-white/70 hover:bg-white transition ${
                    active ? "bg-white" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="sm:hidden">
          <div className="relative flex items-center justify-center py-1">
            {!isHome && (
              <Link
                href="/"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-extrabold text-slate-800"
                aria-label="Back to home"
                title="Back to home"
              >
                ←
              </Link>
            )}

            <Link
              href="/"
              onClick={handleMaintenanceTap}
              className="text-lg font-extrabold tracking-tight text-slate-800"
            >
              Keilim
            </Link>
          </div>

          <nav className="-mx-3 overflow-x-auto px-3 pb-1 no-scrollbar">
            <div className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={pillStyle(active)}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
        </div>
      </header>

      {maintenanceOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Maintenance</h2>
              <button
                type="button"
                onClick={() => setMaintenanceOpen(false)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <p>Tap sequence: {REQUIRED_TAPS} taps on the title within {TAP_WINDOW_MS / 1000} seconds.</p>
              <p>Network: {onlineStatus}</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleSyncNow()}
                disabled={isBusy}
                className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Sync from Sheet
              </button>

              <button
                type="button"
                onClick={() => void handleUpdateServiceWorker()}
                disabled={isBusy}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
              >
                Update Offline App
              </button>

              <button
                type="button"
                onClick={() => void handleClearCache()}
                disabled={isBusy}
                className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
              >
                Clear Device Cache
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800"
              >
                Reload Kiosk
              </button>
            </div>

            {statusMessage ? (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {statusMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
