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
  { href: "/android", label: "Android" },
  { href: "/contact", label: "Contact" },
];

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [onlineStatus, setOnlineStatus] = useState("unknown");

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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

  function toggleDrawer() {
    setDrawerOpen((current) => !current);
  }

  const pulltabHref = drawerOpen ? "#" : "#site-navigation-drawer";

  return (
    <>
      {/* Left pulltab: primary kiosk trigger for opening navigation */}
      <div className="fixed left-0 top-1/4 z-[70] flex">
        <a
          href={pulltabHref}
          role="button"
          onClick={(event) => {
            event.preventDefault();
            toggleDrawer();
          }}
          aria-label={drawerOpen ? "Close menu pulltab" : "Open menu pulltab"}
          className="rounded-r-xl bg-sky-700 px-2 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-900 active:bg-sky-900"
        >
          {drawerOpen ? "Close" : "Menu"}
        </a>
      </div>

      {/* ── Slim sticky header ── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50">
        <div className="mx-auto flex h-12 w-full max-w-screen-xl items-center gap-3 px-3 sm:px-4">
          <div className="h-11 w-11 shrink-0" aria-hidden="true" />

          {/* Centre: logo */}
          <Link
            href="/"
            onClick={handleMaintenanceTap}
            className="flex-1 text-center text-lg font-extrabold tracking-tight text-slate-800"
          >
            Keilim
          </Link>

          {/* Right: explicit home shortcut when not on home */}
          {!isHome ? (
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl font-extrabold text-slate-700 hover:bg-white/60 transition"
            >
              ←
            </Link>
          ) : (
            <div className="h-9 w-9 shrink-0" />
          )}
        </div>
      </header>

      {/* ── Drawer backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Slide-out drawer ── */}
      <nav
        id="site-navigation-drawer"
        aria-label="Site navigation"
        data-open={drawerOpen ? "true" : "false"}
        className="fixed left-0 top-0 z-[80] flex h-full w-64 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(-110%)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-lg font-extrabold tracking-tight text-slate-800">Keilim</span>
          <a
            href="#"
            role="button"
            aria-label="Close navigation"
            onClick={(event) => {
              event.preventDefault();
              setDrawerOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </a>

        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center px-5 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Donate CTA at drawer bottom */}
        <div className="border-t border-slate-100 p-4">
          <Link
            href="/donate"
            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition ${
              pathname === "/donate"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            Donate
          </Link>
        </div>
      </nav>

      {/* ── Donate pull-tab (right edge) ── */}
      <Link
        href="/donate"
        aria-label="Donate"
        className={`fixed right-0 top-1/2 z-30 -translate-y-1/2 select-none rounded-l-xl px-2 py-4 text-sm font-semibold text-white shadow-lg transition [writing-mode:vertical-lr] ${
          pathname === "/donate" ? "bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        Donate
      </Link>

      {/* ── Maintenance modal ── */}
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
