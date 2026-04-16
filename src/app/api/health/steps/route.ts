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
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { computeStickerSize, STEPS_GOAL, STRENGTH_TYPES } from "@/lib/sticker-utils";

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

/**
 * Evaluate sticker for a specific date and upsert into daily_stickers.
 * Uses service-role client (no user session in webhook context).
 */
async function evaluateSticker(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  stepCount: number
) {
  // Check for a completed strength workout on this date (using completed_at as the actual workout date)
  // NULL workout_type = legacy strength sessions (before type was added)
  const { data: workouts } = await supabase
    .from("workout_sessions")
    .select("id, workout_type")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .gte("completed_at", `${date}T00:00:00`)
    .lt("completed_at", `${date}T23:59:59.999`)
    .or("workout_type.in.(Upper,Lower),workout_type.is.null");

  const hadWorkout = (workouts?.length ?? 0) > 0;
  const stickerSize = computeStickerSize(hadWorkout, stepCount);

  const { error } = await supabase.from("daily_stickers").upsert(
    {
      user_id: userId,
      date,
      sticker_size: stickerSize,
      had_workout: hadWorkout,
      had_10k_steps: stepCount >= STEPS_GOAL,
      step_count: stepCount,
    },
    { onConflict: "user_id,date" }
  );

  if (error) {
    console.error(`[sticker] eval error for ${date}:`, error.message);
  }
}

/**
 * Backfill stickers for recent dates that have a workout or steps but no sticker row yet.
 * Catches days where the shortcut didn't fire.
 */
async function backfillStickers(
  supabase: SupabaseClient,
  userId: string,
  excludeDates: string[]
) {
  const lookbackDays = 7;
  const start = new Date();
  start.setDate(start.getDate() - lookbackDays);
  const startDate = start.toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  // Get existing sticker dates so we skip them
  const { data: existingStickers } = await supabase
    .from("daily_stickers")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", today);

  const coveredDates = new Set([
    ...excludeDates,
    ...(existingStickers ?? []).map((s: { date: string }) => s.date),
  ]);

  // Get steps for uncovered dates
  const { data: stepRows } = await supabase
    .from("daily_steps")
    .select("date, step_count")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", today);

  // Get strength workouts for uncovered dates (use completed_at as actual workout date)
  // NULL workout_type = legacy strength sessions (before type was added)
  const { data: workoutRows } = await supabase
    .from("workout_sessions")
    .select("completed_at, workout_type")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .gte("completed_at", `${startDate}T00:00:00`)
    .lte("completed_at", `${today}T23:59:59.999`)
    .or("workout_type.in.(Upper,Lower),workout_type.is.null");

  // Build a map of date → { steps, hadWorkout }
  const dateMap = new Map<string, { steps: number; hadWorkout: boolean }>();

  for (const row of stepRows ?? []) {
    const d = row.date as string;
    if (coveredDates.has(d)) continue;
    if (!dateMap.has(d)) dateMap.set(d, { steps: 0, hadWorkout: false });
    dateMap.get(d)!.steps = row.step_count as number;
  }

  for (const row of workoutRows ?? []) {
    const d = (row.completed_at as string).split("T")[0];
    if (coveredDates.has(d)) continue;
    if (!dateMap.has(d)) dateMap.set(d, { steps: 0, hadWorkout: false });
    dateMap.get(d)!.hadWorkout = true;
  }

  // Evaluate uncovered dates that have any data (mark as seen — these are historical backfills)
  for (const [date, info] of dateMap) {
    const stickerSize = computeStickerSize(info.hadWorkout, info.steps);
    await supabase.from("daily_stickers").upsert(
      {
        user_id: userId,
        date,
        sticker_size: stickerSize,
        had_workout: info.hadWorkout,
        had_10k_steps: info.steps >= STEPS_GOAL,
        step_count: info.steps,
        seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
  }
}

export async function POST(req: NextRequest) {
  // --- Auth ---
  const authHeader = req.headers.get("authorization") ?? "";
  const secret = process.env.HEALTH_API_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Parse body ---
  const contentType = req.headers.get("content-type") ?? "";
  let records: StepRecord[];

  if (contentType.includes("form")) {
    const form = await req.formData();
    const date = String(form.get("date") ?? form.get("Date") ?? "").trim();
    const rawSteps = String(form.get("steps") ?? form.get("Steps") ?? "").replace(/,/g, "").trim();
    const steps = Math.round(parseFloat(rawSteps));
    if (!date || isNaN(steps)) {
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
    if (!body?.data?.length) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    records = body.data.map((r) => ({
      date: r.date,
      steps: Math.round(parseFloat(String(r.steps).replace(/,/g, ""))),
    }));
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

  // --- Sticker evaluation (run in background so Shortcuts gets a fast response) ---
  // Vercel keeps the function alive for `after()` work even after the response is sent.
  after(async () => {
    try {
      const syncedDates: string[] = [];
      for (const row of rows) {
        await evaluateSticker(supabase, userId, row.date, row.step_count);
        syncedDates.push(row.date);
      }
      // Backfill any recent dates that were missed (phone died, shortcut skipped, etc.)
      await backfillStickers(supabase, userId, syncedDates);
    } catch (err) {
      console.error("[health/steps] background sticker work failed:", err);
    }
  });

  return NextResponse.json({ ok: true, synced: rows.length });
}
