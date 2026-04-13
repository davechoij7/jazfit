/**
 * POST /api/health/steps
 *
 * Webhook called by an iOS Shortcut to sync Apple Health step data.
 *
 * Required environment variables:
 *   HEALTH_API_SECRET        — shared secret; must match the Shortcut's Authorization header
 *   HEALTH_USER_ID           — Jazmin's Supabase auth UUID (hardcoded via env so no session needed)
 *   SUPABASE_SERVICE_ROLE_KEY — service-role key that bypasses RLS (server only, never exposed to client)
 *
 * Request:
 *   Authorization: Bearer <HEALTH_API_SECRET>
 *   Content-Type: application/json
 *   { "data": [{ "date": "YYYY-MM-DD", "steps": 12345 }, ...] }
 *
 * Response 200: { "ok": true, "synced": <number of records upserted> }
 * Response 401: { "error": "Unauthorized" }
 * Response 400: { "error": "Invalid body" }
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface StepRecord {
  date: string;
  steps: number;
}

interface RequestBody {
  data: StepRecord[];
}

export async function POST(req: NextRequest) {
  // --- Auth ---
  const authHeader = req.headers.get("authorization") ?? "";
  const secret = process.env.HEALTH_API_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Parse body (accepts JSON array or form-encoded single record) ---
  const contentType = req.headers.get("content-type") ?? "";
  let records: StepRecord[];

  if (contentType.includes("form")) {
    const form = await req.formData();
    const date = form.get("date");
    const rawSteps = String(form.get("steps") ?? "").replace(/,/g, "");
    const steps = Math.round(parseFloat(rawSteps));
    if (!date || typeof date !== "string" || isNaN(steps)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    records = [{ date, steps }];
  } else {
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (
      !body ||
      !Array.isArray(body.data) ||
      body.data.length === 0 ||
      body.data.some(
        (r) =>
          typeof r.date !== "string" ||
          typeof r.steps !== "number" ||
          isNaN(r.steps)
      )
    ) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    records = body.data;
  }

  const userId = process.env.HEALTH_USER_ID;
  if (!userId) {
    return NextResponse.json(
      { error: "HEALTH_USER_ID not configured" },
      { status: 500 }
    );
  }

  // --- Upsert ---
  const supabase = createServiceClient();

  const rows = records.map((r) => ({
    user_id: userId,
    date: r.date,
    step_count: r.steps,
  }));

  const { error } = await supabase
    .from("daily_steps")
    .upsert(rows, { onConflict: "user_id,date" });

  if (error) {
    console.error("[health/steps] upsert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, synced: rows.length });
}
