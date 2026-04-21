"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type WledStatus = {
  configured: boolean;
  configurationMessage: string | null;
  defaultPreset: number;
  allowedPresets: number[];
  overrideMinutes: number;
  activeOverride: {
    preset: number;
    startedAt: string;
    endsAt: string;
    remainingMs: number;
  } | null;
};

type WledApiResponse = {
  data?: WledStatus;
  error?: {
    code: string;
    message: string;
  };
};

function formatRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function LightsPage() {
  const [status, setStatus] = useState<WledStatus | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const refreshStatus = useCallback(async () => {
    const response = await fetch("/api/wled", { cache: "no-store" });
    const parsed = (await response.json().catch(() => null)) as WledApiResponse | null;

    if (!response.ok || !parsed?.data) {
      throw new Error(parsed?.error?.message || `Status request failed (${response.status})`);
    }

    setStatus(parsed.data);
  }, []);

  async function applyPreset(preset: number) {
    setIsBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/wled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", preset }),
      });

      const parsed = (await response.json().catch(() => null)) as WledApiResponse | null;
      if (!response.ok || !parsed?.data) {
        throw new Error(parsed?.error?.message || `Preset change failed (${response.status})`);
      }

      setStatus(parsed.data);
      setMessage(`Preset ${preset} is active for ${parsed.data.overrideMinutes} minutes.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to apply preset.");
    } finally {
      setIsBusy(false);
    }
  }

  async function revertNow() {
    setIsBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/wled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revert-now" }),
      });

      const parsed = (await response.json().catch(() => null)) as WledApiResponse | null;
      if (!response.ok || !parsed?.data) {
        throw new Error(parsed?.error?.message || `Revert failed (${response.status})`);
      }

      setStatus(parsed.data);
      setMessage(`Reverted to default preset ${parsed.data.defaultPreset}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to revert preset.");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    void refreshStatus().catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Unable to load WLED status.");
    });

    const interval = window.setInterval(() => {
      setNow(Date.now());
      void refreshStatus().catch(() => {
        // Keep UI usable if a polling request fails.
      });
    }, 5_000);

    return () => window.clearInterval(interval);
  }, [refreshStatus]);

  const remainingLabel = useMemo(() => {
    if (!status?.activeOverride) {
      return null;
    }

    const remainingMs = new Date(status.activeOverride.endsAt).getTime() - now;
    return formatRemaining(remainingMs);
  }, [status?.activeOverride, now]);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 py-4 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Room Lights</h1>
      <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
        Users can choose a pattern for a limited time, then the room automatically returns to the default preset.
      </p>

      {status && !status.configured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {status.configurationMessage || "WLED is not configured yet."}
        </div>
      ) : null}

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>
            Default preset: <span className="font-semibold text-slate-900">{status?.defaultPreset ?? "-"}</span>
          </p>
          <p>
            Override window: <span className="font-semibold text-slate-900">{status?.overrideMinutes ?? "-"} minutes</span>
          </p>
          <p className="sm:col-span-2">
            Active override: <span className="font-semibold text-slate-900">{status?.activeOverride?.preset ?? "None"}</span>
            {remainingLabel ? <span className="ml-2 text-slate-600">(remaining {remainingLabel})</span> : null}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-bold text-slate-900">Choose Pattern</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(status?.allowedPresets || []).map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={isBusy || status?.configured === false}
              onClick={() => void applyPreset(preset)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Preset {preset}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isBusy || status?.configured === false}
          onClick={() => void revertNow()}
          className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          Revert Now
        </button>
      </div>
    </section>
  );
}
