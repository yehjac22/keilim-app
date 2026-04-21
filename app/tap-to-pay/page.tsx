"use client";

import { useMemo, useState } from "react";

type ApiResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
};

export default function TapToPayPage() {
  const [deviceId, setDeviceId] = useState("");
  const [amount, setAmount] = useState("1.00");
  const [externalRequestId, setExternalRequestId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const generatedRequestId = useMemo(
    () => `keilim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  async function callCloudim(payload: Record<string, unknown>) {
    setIsBusy(true);
    try {
      const response = await fetch("/api/payments/cloudim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
      const parsed: ApiResult = { ok: response.ok, status: response.status, data };
      setResult(parsed);

      const responseData = data && typeof data === "object" && "data" in data ? (data.data as Record<string, unknown>) : null;
      const maybeSessionId = responseData && typeof responseData.xSessionId === "string" ? responseData.xSessionId : null;
      if (maybeSessionId) {
        setSessionId(maybeSessionId);
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 py-4 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Tap to Pay (Sola CloudIM)</h1>
      <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
        This page starts a terminal session on your registered Sola device and polls for results. The actual card tap happens on the payment terminal, not in this browser.
      </p>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm text-slate-700">
          Device ID
          <input
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="xDeviceId"
          />
        </label>

        <label className="text-sm text-slate-700">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="1.00"
          />
        </label>

        <label className="text-sm text-slate-700 sm:col-span-2">
          External Request ID
          <input
            value={externalRequestId}
            onChange={(event) => setExternalRequestId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder={generatedRequestId}
          />
        </label>

        <label className="text-sm text-slate-700 sm:col-span-2">
          Session ID (for result polling)
          <input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="session123"
          />
        </label>

        <div className="sm:col-span-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isBusy || !deviceId}
            onClick={() => callCloudim({ action: "deviceStatus", deviceId })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Check Device Status
          </button>
          <button
            type="button"
            disabled={isBusy || !deviceId || !amount}
            onClick={() =>
              callCloudim({
                action: "startSession",
                deviceId,
                amount,
                externalRequestId: externalRequestId || generatedRequestId,
                command: "cc:sale",
                enableTipPrompt: true,
              })
            }
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Start Tap Session
          </button>
          <button
            type="button"
            disabled={isBusy || (!sessionId && !externalRequestId)}
            onClick={() =>
              callCloudim({
                action: "sessionResult",
                sessionId: sessionId || undefined,
                externalRequestId: externalRequestId || undefined,
              })
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-60 sm:col-span-2"
          >
            Poll Session Result
          </button>
        </div>
      </div>

      <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
        {JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
}
