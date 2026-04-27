"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  defaultAmountCents: number; // e.g. 1000 = $10.00
  orgName: string;
};

type Flow = "idle" | "initializing" | "success" | "error";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DonateClient({ defaultAmountCents, orgName }: Props) {
  const chargeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [rawCents, setRawCents] = useState(0); // 0 = use default
  const [reference, setReference] = useState("");
  const [flow, setFlow] = useState<Flow>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const effectiveCents = rawCents > 0 ? rawCents : defaultAmountCents;

  const requestId = useMemo(
    () => `donation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  function pressDigit(d: number) {
    setRawCents((prev) => {
      const next = prev * 10 + d;
      return next > 99999 ? prev : next; // cap at $999.99
    });
  }

  function pressClear() {
    setRawCents(0);
    setFlow("idle");
    setErrorMsg("");
  }

  const isBusy = flow === "initializing";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = params.get("xResult");
    if (!resultCode) {
      return;
    }

    const normalizedResult = resultCode.toUpperCase();
    const status = params.get("xStatus") || "";
    const error = params.get("xError") || "";

    if (normalizedResult === "A" || status.toLowerCase().includes("approved")) {
      setFlow("success");
      setErrorMsg("");
    } else {
      setFlow("error");
      setErrorMsg(error || status || "Payment was not approved.");
    }

    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (flow === "success" || isBusy) {
      return;
    }

    chargeButtonRef.current?.focus();
  }, [flow, isBusy]);

  async function handleCharge() {
    if (isBusy) return;

    setFlow("initializing");
    setErrorMsg("");

    try {
      const amountStr = (effectiveCents / 100).toFixed(2);
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      const trimmedReference = reference.trim();
      const resolvedDescription = trimmedReference ? `Donation - ${trimmedReference}` : "Keilim donation";
      const params = new URLSearchParams({
        xAmount: amountStr,
        AmountLocked: "1",
        xDescription: resolvedDescription,
        xCustom02: trimmedReference,
        xCustom03: trimmedReference,
        xInvoice: requestId,
        xEnableTipPrompt: "0",
        xAllowPartialAuth: "false",
        xExternalRequestId: requestId,
        xCommand: "cc:sale",
        xSoftwareName: orgName || "Keilim Kiosk",
        xSoftwareVersion: "1.0.0",
        xRedirectURL: redirectUrl,
      });

      window.location.href = `cardknox://tap.cardknox.com/transaction?${params.toString()}`;
    } catch {
      setErrorMsg("Unable to launch Tap to Pay Helper app.");
      setFlow("error");
    }
  }

  if (flow === "success") {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-12 text-center shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-900">Thank you!</p>
          <p className="mt-1 text-sm text-slate-500">
            Your donation of {formatCents(effectiveCents)} was received.
          </p>
          {reference.trim() && (
            <p className="mt-1 text-xs text-slate-400">Ref: {reference.trim()}</p>
          )}
          <button
            type="button"
            onClick={pressClear}
            className="mt-6 w-full rounded-xl bg-blue-700 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-blue-800 transition"
          >
            New Donation
          </button>
        </div>
      </div>
    );
  }

  const chargeLabel = () => {
    if (flow === "initializing") return "Opening Helper...";
    return `Charge ${formatCents(effectiveCents)}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-start justify-center py-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="px-6 pb-2 pt-5 text-center">
          <p className="text-base font-bold tracking-wide text-blue-600">{orgName}</p>
        </div>

        {/* Reference input */}
        <div className="px-4 pb-3">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Add a Reference"
            maxLength={80}
            className="w-full rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Amount display */}
        <div className="px-4 pb-4 text-center">
          <p className="text-sm text-slate-400">
            {formatCents(defaultAmountCents)}
          </p>
          <p className="tabular-nums text-5xl font-light tracking-tight text-slate-900">
            {formatCents(effectiveCents)}
          </p>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              type="button"
              disabled={isBusy}
              onClick={() => pressDigit(d)}
              className="rounded-xl bg-slate-50 py-4 text-xl font-light text-slate-800 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50"
            >
              {d}
            </button>
          ))}

          {/* C */}
          <button
            type="button"
            disabled={isBusy}
            onClick={pressClear}
            className="rounded-xl bg-red-500 py-4 text-xl font-semibold text-white transition hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
          >
            C
          </button>

          {/* 0 */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => pressDigit(0)}
            className="rounded-xl bg-slate-50 py-4 text-xl font-light text-slate-800 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50"
          >
            0
          </button>

          {/* + — same as Charge */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleCharge()}
            className="rounded-xl bg-green-500 py-4 text-xl font-semibold text-white transition hover:bg-green-600 active:bg-green-700 disabled:opacity-50"
          >
            +
          </button>
        </div>

        {/* Status messages */}
        {flow === "error" && errorMsg && (
          <p className="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
            {errorMsg}
          </p>
        )}

        {/* Charge button */}
        <div className="p-4 pt-1">
          <button
            ref={chargeButtonRef}
            type="button"
            onClick={() => void handleCharge()}
            disabled={isBusy}
            className="w-full rounded-xl bg-blue-700 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-blue-800 active:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {chargeLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
