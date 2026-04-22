import { NextResponse } from "next/server";

import { getUtensils } from "@/lib/utensilsData";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasSheetsId = Boolean(process.env.GOOGLE_SHEETS_ID);
  const hasApiKey = Boolean(process.env.GOOGLE_API_KEY);
  const sheetRange = process.env.SHEET_RANGE || "Sheet1!A:I1000";

  if (!hasSheetsId || !hasApiKey) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        reason: "Missing GOOGLE_SHEETS_ID or GOOGLE_API_KEY",
        config: {
          hasSheetsId,
          hasApiKey,
          sheetRange,
        },
      },
      { status: 500 }
    );
  }

  try {
    const result = await getUtensils(true);
    const connected = result.source === "google-sheets";

    return NextResponse.json({
      ok: connected,
      connected,
      source: result.source,
      count: result.items.length,
      updatedAt: result.updatedAt,
      config: {
        hasSheetsId,
        hasApiKey,
        sheetRange,
      },
      reason: connected ? "Connected to Google Sheets" : "Using local cache or unavailable",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        reason: "Sheets fetch failed",
        config: {
          hasSheetsId,
          hasApiKey,
          sheetRange,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}