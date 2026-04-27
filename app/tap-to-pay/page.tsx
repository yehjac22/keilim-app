"use client";

import { useEffect, useMemo, useState } from "react";

export default function TapToPayPage() {
  const [amount, setAmount] = useState("1.00");
  const [description, setDescription] = useState("Keilim donation");
  const [summary, setSummary] = useState("");
  const [months, setMonths] = useState("");
  const [invoice, setInvoice] = useState("");
  const [enableTipPrompt, setEnableTipPrompt] = useState(true);
  const [allowPartialAuth, setAllowPartialAuth] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [externalRequestId, setExternalRequestId] = useState("");
  const [helperResult, setHelperResult] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const generatedRequestId = useMemo(
    () => `keilim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    setRedirectUrl(`${currentUrl.origin}${currentUrl.pathname}`);

    const callbackParams: Record<string, string> = {};
    currentUrl.searchParams.forEach((value, key) => {
      if (key.toLowerCase().startsWith("x")) {
        callbackParams[key] = value;
      }
    });
    setHelperResult(callbackParams);
  }, []);

  const helperDeepLinkUrl = useMemo(() => {
    const resolvedExternalRequestId = externalRequestId || generatedRequestId;
    const params = new URLSearchParams({
      xAmount: amount,
      AmountLocked: "1",
      xDescription: description,
      xCustom02: description,
      xCustom03: summary,
      xInvoice: invoice || resolvedExternalRequestId,
      xEnableTipPrompt: enableTipPrompt ? "1" : "0",
      xAllowPartialAuth: allowPartialAuth ? "true" : "false",
      xCommand: "cc:sale",
      xExternalRequestId: resolvedExternalRequestId,
      xSoftwareName: "Keilim Kiosk",
      xSoftwareVersion: "1.0.0",
    });

    if (redirectUrl) {
      params.set("xRedirectURL", redirectUrl);
    }

    if (months.trim()) {
      params.set("xEnableRecurring", "1");
      params.set("xIntervalCount", "1");
      params.set("xIntervalType", "Month");
      params.set("xTotalPayments", months.trim());
    }

    return `cardknox://tap.cardknox.com/transaction?${params.toString()}`;
  }, [
    amount,
    description,
    summary,
    months,
    invoice,
    enableTipPrompt,
    allowPartialAuth,
    externalRequestId,
    generatedRequestId,
    redirectUrl,
  ]);

  function launchHelperDeepLink() {
    window.location.href = helperDeepLinkUrl;
  }

  async function copyHelperDeepLink() {
    try {
      await navigator.clipboard.writeText(helperDeepLinkUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 py-4 sm:py-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Tap to Pay (Sola Helper)</h1>
      <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
        This page launches the Sola Tap-to-Pay Helper app on Android and receives callback parameters after payment.
      </p>

      <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h2 className="text-lg font-bold text-emerald-900">Sola Helper Deep Link (Galaxy)</h2>
        <p className="text-sm text-emerald-900/90">
          Use this to launch the Sola Tap-to-Pay Helper app directly on Android tablets. For production, keep keys server-side and avoid sending secrets in the deep link.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-700">
            Amount
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="1.00"
            />
          </label>

          <label className="text-sm text-slate-700">
            Recurring Months (optional)
            <input
              value={months}
              onChange={(event) => setMonths(event.target.value.replace(/[^0-9]/g, ""))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="12"
            />
          </label>

          <label className="text-sm text-slate-700 sm:col-span-2">
            Description
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Keilim donation"
            />
          </label>

          <label className="text-sm text-slate-700 sm:col-span-2">
            Summary / xCustom03
            <input
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Optional summary"
            />
          </label>

          <label className="text-sm text-slate-700 sm:col-span-2">
            Invoice (optional)
            <input
              value={invoice}
              onChange={(event) => setInvoice(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Invoice number"
            />
          </label>

          <label className="text-sm text-slate-700 sm:col-span-2">
            External Request ID (optional)
            <input
              value={externalRequestId}
              onChange={(event) => setExternalRequestId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Leave blank to auto-generate"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={enableTipPrompt}
              onChange={(event) => setEnableTipPrompt(event.target.checked)}
            />
            Enable tip prompt
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={allowPartialAuth}
              onChange={(event) => setAllowPartialAuth(event.target.checked)}
            />
            Allow partial auth
          </label>

          <label className="text-sm text-slate-700 sm:col-span-2">
            Redirect URL
            <input
              value={redirectUrl}
              onChange={(event) => setRedirectUrl(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="https://your-app.example/tap-to-pay"
            />
          </label>
        </div>

        <pre className="overflow-x-auto rounded-xl border border-emerald-200 bg-white p-3 text-xs text-slate-800">
          {helperDeepLinkUrl}
        </pre>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={launchHelperDeepLink}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
          >
            Launch Helper Deep Link
          </button>
          <button
            type="button"
            onClick={() => void copyHelperDeepLink()}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900"
          >
            Copy Deep Link URL
          </button>
        </div>

        {copyState !== "idle" ? (
          <p className="text-xs text-emerald-900">
            {copyState === "copied" ? "Deep link copied." : "Copy failed on this browser/device."}
          </p>
        ) : null}

        <pre className="overflow-x-auto rounded-xl border border-emerald-200 bg-white p-3 text-xs text-slate-800">
          Helper callback params: {JSON.stringify(helperResult, null, 2)}
        </pre>
      </div>
    </section>
  );
}
