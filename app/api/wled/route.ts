import { NextResponse } from "next/server";

type WledStatusResponse = {
  data: {
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
};

type WledActionBody = {
  action?: "start" | "revert-now";
  preset?: number;
};

type ActiveOverride = {
  preset: number;
  startedAtMs: number;
  endsAtMs: number;
};

const DEFAULT_OVERRIDE_MINUTES = 5;

let activeOverride: ActiveOverride | null = null;
let revertTimer: ReturnType<typeof setTimeout> | null = null;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getConfig() {
  const baseUrl = (process.env.WLED_BASE_URL || "").trim().replace(/\/$/, "");
  const defaultPreset = parsePositiveInt(process.env.WLED_DEFAULT_PRESET, 1);
  const overrideMinutes = parsePositiveInt(process.env.WLED_OVERRIDE_MINUTES, DEFAULT_OVERRIDE_MINUTES);

  const parsedAllowed = (process.env.WLED_ALLOWED_PRESETS || "")
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((part) => Number.isFinite(part) && part > 0);

  const allowedPresets = parsedAllowed.length > 0 ? parsedAllowed : [defaultPreset];

  return { baseUrl, defaultPreset, allowedPresets, overrideMinutes };
}

function buildStatusPayload(): WledStatusResponse["data"] {
  const { baseUrl, defaultPreset, allowedPresets, overrideMinutes } = getConfig();
  const now = Date.now();

  const mappedOverride =
    activeOverride && activeOverride.endsAtMs > now
      ? {
          preset: activeOverride.preset,
          startedAt: new Date(activeOverride.startedAtMs).toISOString(),
          endsAt: new Date(activeOverride.endsAtMs).toISOString(),
          remainingMs: Math.max(0, activeOverride.endsAtMs - now),
        }
      : null;

  return {
    configured: Boolean(baseUrl),
    configurationMessage: baseUrl ? null : "WLED is not configured yet. Set WLED_BASE_URL in .env.local.",
    defaultPreset,
    allowedPresets,
    overrideMinutes,
    activeOverride: mappedOverride,
  };
}

function clearTimer() {
  if (revertTimer) {
    clearTimeout(revertTimer);
    revertTimer = null;
  }
}

async function setWledPreset(baseUrl: string, preset: number) {
  const response = await fetch(`${baseUrl}/json/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ on: true, ps: preset }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`WLED update failed (${response.status})`);
  }
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

async function revertToDefault() {
  const { baseUrl, defaultPreset } = getConfig();
  if (!baseUrl) {
    activeOverride = null;
    clearTimer();
    return;
  }

  try {
    await setWledPreset(baseUrl, defaultPreset);
  } finally {
    activeOverride = null;
    clearTimer();
  }
}

function scheduleRevert(minutes: number) {
  clearTimer();
  revertTimer = setTimeout(() => {
    void revertToDefault();
  }, minutes * 60_000);
}

export async function GET() {
  return NextResponse.json({ data: buildStatusPayload() });
}

export async function POST(request: Request) {
  const { baseUrl, allowedPresets, defaultPreset, overrideMinutes } = getConfig();

  if (!baseUrl) {
    return jsonError(409, "WLED_NOT_CONFIGURED", "Set WLED_BASE_URL in environment.");
  }

  let body: WledActionBody;
  try {
    body = (await request.json()) as WledActionBody;
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (body.action === "revert-now") {
    try {
      await setWledPreset(baseUrl, defaultPreset);
      activeOverride = null;
      clearTimer();
      return NextResponse.json({ data: buildStatusPayload() });
    } catch {
      return jsonError(502, "WLED_REVERT_FAILED", "Unable to set default preset on WLED.");
    }
  }

  if (body.action === "start") {
    const preset = Number(body.preset);
    if (!Number.isFinite(preset) || preset <= 0) {
      return jsonError(400, "INVALID_PRESET", "preset must be a positive number.");
    }

    if (!allowedPresets.includes(preset)) {
      return jsonError(403, "PRESET_NOT_ALLOWED", "That preset is not in WLED_ALLOWED_PRESETS.");
    }

    try {
      await setWledPreset(baseUrl, preset);
      const now = Date.now();
      activeOverride = {
        preset,
        startedAtMs: now,
        endsAtMs: now + overrideMinutes * 60_000,
      };
      scheduleRevert(overrideMinutes);
      return NextResponse.json({ data: buildStatusPayload() });
    } catch {
      return jsonError(502, "WLED_SET_FAILED", "Unable to apply preset on WLED.");
    }
  }

  return jsonError(400, "UNSUPPORTED_ACTION", "Use action=start or action=revert-now.");
}
