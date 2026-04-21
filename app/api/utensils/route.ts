import { NextResponse } from "next/server";

import { getUtensils } from "@/lib/utensilsData";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "1";
    const result = await getUtensils(forceRefresh);

    if (result.items.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "UTENSILS_UNAVAILABLE",
            message: "No Google Sheets data is available yet and no offline cache has been saved.",
          },
          meta: {
            source: result.source,
            updatedAt: result.updatedAt,
            count: 0,
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      data: result.items,
      meta: {
        source: result.source,
        updatedAt: result.updatedAt,
        count: result.items.length,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "UTENSILS_FETCH_FAILED",
          message: "Unable to load utensils data",
        },
      },
      { status: 500 }
    );
  }
}
