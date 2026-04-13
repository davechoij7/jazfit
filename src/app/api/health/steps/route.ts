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

  // --- Parse body: try form first, then JSON, echo debug info ---
  const contentType = req.headers.get("content-type") ?? "";
  let records: StepRecord[] | null = null;
  let debugInfo: Record<string, unknown> = { contentType };

  // Try form data
  try {
    const cloned = req.clone();
    const form = await cloned.formData();
    const entries: Record<string, string> = {};
    form.forEach((v, k) => { entries[k] = String(v); });
    debugInfo.formEntries = entries;
    const date = form.get("date");
    const rawSteps = String(form.get("steps") ?? "").replace(/,/g, "").trim();
    const steps = Math.round(parseFloat(rawSteps));
    if (date && typeof date === "string" && !isNaN(steps)) {
      records = [{ date, steps }];
    }
  } catch { /* not form data */ }

  // Try JSON
  if (!records) {
    try {
      const cloned = req.clone();
      const body: RequestBody = await cloned.json();
      debugInfo.jsonBody = body;
      if (body?.data?.length > 0) {
        records = body.data.map((r) => ({
          date: r.date,
          steps: Math.round(parseFloat(String(r.steps).replace(/,/g, ""))),
        }));
      }
    } catch { /* not json */ }
  }

  // Try raw text
  if (!records) {
    try {
      const cloned = req.clone();
      const text = await cloned.text();
      debugInfo.rawText = text;
    } catch { /* ignore */ }
    return NextResponse.json({ error: "Invalid body", debug: debugInfo }, { status: 400 });
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
