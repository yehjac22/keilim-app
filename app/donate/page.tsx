"use client";

import { useMemo, useState } from "react";

type ApiResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
};

const PRESET_AMOUNTS = [
  { label: "$5", value: "5.00" },
  { label: "$10", value: "10.00" },
  { label: "$25", value: "25.00" },
  { label: "$50", value: "50.00" },
];

export default function DonatePage() {
  const [amount, setAmount] = useState("10.00");
  const [customAmount, setCustomAmount] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting-tap" | "success" | "error">("idle");

  const generatedRequestId = useMemo(
    () => `donation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const finalAmount = customAmount.trim() ? customAmount : amount;

  async function callCloudim(payload: Record<string, unknown>) {
    setIsBusy(true);
    setStatus("waiting-tap");
    try {
      const response = await fetch("/api/payments/cloudim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
      const parsed: ApiResult = { ok: response.ok, status: response.status, data };
      setResult(parsed);

      if (response.ok) {
        const responseData =
          data && typeof data === "object" && "data" in data
            ? (data.data as Record<string, unknown>)
            : null;
        const maybeSessionId =
          responseData && typeof responseData.xSessionId === "string"
            ? responseData.xSessionId
            : null;
        if (maybeSessionId) {
          setSessionId(maybeSessionId);
          setStatus("waiting-tap");
        }
      } else {
        setStatus("error");
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function initiateDonation() {
    if (!deviceId || !finalAmount) return;

    await callCloudim({
      action: "startSession",
      deviceId,
      amount: finalAmount,
      externalRequestId: generatedRequestId,
      command: "cc:sale",
      enableTipPrompt: false,
    });
  }

  async function pollResult() {
    if (!sessionId) return;

    await callCloudim({
      action: "sessionResult",
      sessionId,
    });
  }

  const isSuccess =
    result?.ok && result?.status === 200 && result?.data && typeof result.data === "object"
      ? ("success" in result.data)
      : false;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 py-4 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Make a Donation</h1>
        <p className="text-slate-600">
          Support our mission by making a donation today. Tap your card on the terminal when prompted.
        </p>
      </div>

      {/* Amount Selection */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-700">Select Amount</h2>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                setAmount(preset.value);
                setCustomAmount("");
              }}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${
                amount === preset.value && !customAmount
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div>
          <label className="text-xs font-medium text-slate-600">Custom Amount</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-6 text-sm placeholder-slate-400"
            />
          </div>
        </div>

        {/* Display Final Amount */}
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
          <p className="text-xs text-blue-600">Donation Amount</p>
          <p className="text-2xl font-bold text-blue-900">${finalAmount}</p>
        </div>
      </div>

      {/* Device Configuration */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-700">Payment Terminal</h2>

        <label className="block text-sm">
          <span className="text-slate-700">Device ID</span>
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="Enter your Sola device ID"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <p className="text-xs text-slate-500">
          Your device ID is configured in Sola CloudIM. Contact your merchant administrator if you don't have this.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {!sessionId && (
          <button
            type="button"
            disabled={isBusy || !deviceId || !finalAmount || status === "success"}
            onClick={initiateDonation}
            className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {isBusy ? "Initializing..." : "Donate via Tap"}
          </button>
        )}

        {sessionId && status !== "success" && (
          <button
            type="button"
            disabled={isBusy || isSuccess}
            onClick={pollResult}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isBusy ? "Checking..." : "Check Payment Status"}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {status === "waiting-tap" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <p className="text-sm font-semibold text-yellow-900">Waiting for card tap...</p>
          <p className="text-xs text-yellow-800 mt-1">Please tap your card on the payment terminal.</p>
        </div>
      )}

      {isSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-semibold text-green-900">✓ Donation successful!</p>
          <p className="text-xs text-green-800 mt-1">Thank you for your generosity.</p>
        </div>
      )}

      {status === "error" && result && !result.ok && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-900">Payment failed</p>
          <p className="text-xs text-red-800 mt-1">
            {typeof result.data === "object" && result.data && "error" in result.data
              ? String(result.data.error)
              : "An error occurred while processing your donation."}
          </p>
        </div>
      )}

      {/* Debug Info */}
      {result && (
        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-slate-700 select-none">
            Debug: API Response
          </summary>
          <pre className="mt-2 overflow-x-auto text-xs text-slate-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
}
