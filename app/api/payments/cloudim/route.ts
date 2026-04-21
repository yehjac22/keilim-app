import { NextResponse } from "next/server";

type CloudimAction = "deviceStatus" | "createDevice" | "startSession" | "sessionResult";

type RequestBody = {
  action?: CloudimAction;
  deviceId?: string;
  amount?: string;
  externalRequestId?: string;
  sessionId?: string;
  command?: string;
  enableTipPrompt?: boolean;
  serialNumber?: string;
  make?: string;
  friendlyName?: string;
};

const DEFAULT_BASE_URL = "https://device.cardknox.com";

function getConfig() {
  const baseUrl = (process.env.SOLA_CLOUDIM_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const apiKey = process.env.SOLA_CLOUDIM_API_KEY || "";
  return { baseUrl, apiKey };
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const { baseUrl, apiKey } = getConfig();
  if (!apiKey) {
    return jsonError(500, "MISSING_CLOUDIM_API_KEY", "Missing SOLA_CLOUDIM_API_KEY in environment.");
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const action = body.action;
  if (!action) {
    return jsonError(400, "MISSING_ACTION", "Missing action in request body.");
  }

  try {
    if (action === "deviceStatus") {
      if (!body.deviceId) {
        return jsonError(400, "MISSING_DEVICE_ID", "deviceId is required for deviceStatus.");
      }

      const response = await fetchWithTimeout(`${baseUrl}/v1/Device/${encodeURIComponent(body.deviceId)}`, {
        method: "GET",
        headers: {
          Authorization: apiKey,
        },
      });

      const data = await response.json().catch(() => null);
      return NextResponse.json({ ok: response.ok, status: response.status, data }, { status: response.status });
    }

    if (action === "createDevice") {
      if (!body.serialNumber || !body.make || !body.friendlyName) {
        return jsonError(
          400,
          "MISSING_CREATE_DEVICE_FIELDS",
          "serialNumber, make, and friendlyName are required for createDevice."
        );
      }

      const response = await fetchWithTimeout(`${baseUrl}/v1/Device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({
          xDeviceSerialNumber: body.serialNumber,
          xDeviceMake: body.make,
          xDeviceFriendlyName: body.friendlyName,
        }),
      });

      const data = await response.json().catch(() => null);
      return NextResponse.json({ ok: response.ok, status: response.status, data }, { status: response.status });
    }

    if (action === "startSession") {
      if (!body.deviceId || !body.amount) {
        return jsonError(400, "MISSING_START_FIELDS", "deviceId and amount are required for startSession.");
      }

      const response = await fetchWithTimeout(`${baseUrl}/v2/session/async`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xKey: apiKey,
          xDeviceId: body.deviceId,
          xCommand: body.command || "cc:sale",
          xAmount: body.amount,
          xEnableTipPrompt: body.enableTipPrompt === true,
          xExternalRequestId: body.externalRequestId,
          xSoftwareName: "Keilim Kiosk",
          xSoftwareVersion: "1.0.0",
        }),
      });

      const data = await response.json().catch(() => null);
      return NextResponse.json({ ok: response.ok, status: response.status, data }, { status: response.status });
    }

    if (action === "sessionResult") {
      if (!body.sessionId && !body.externalRequestId) {
        return jsonError(
          400,
          "MISSING_RESULT_FIELDS",
          "sessionId or externalRequestId is required for sessionResult."
        );
      }

      const response = await fetchWithTimeout(`${baseUrl}/v2/session/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xKey: apiKey,
          xSessionId: body.sessionId,
          xExternalRequestId: body.externalRequestId,
        }),
      });

      const data = await response.json().catch(() => null);
      return NextResponse.json({ ok: response.ok, status: response.status, data }, { status: response.status });
    }

    return jsonError(400, "UNSUPPORTED_ACTION", `Unsupported action: ${String(action)}`);
  } catch {
    return jsonError(502, "CLOUDIM_REQUEST_FAILED", "Unable to reach CloudIM API.");
  }
}
