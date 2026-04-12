"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_KEY = "pin-login";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function login(formData: FormData) {
  const pin = formData.get("pin") as string;

  if (!/^\d{4}$/.test(pin)) {
    return { error: "Enter a 4-digit PIN" };
  }

  const { allowed, retryAfterMs } = checkRateLimit(RATE_LIMIT_KEY, MAX_ATTEMPTS, WINDOW_MS);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60_000);
    return { error: `Too many attempts. Try again in ${minutes} min.` };
  }

  // Constant-time comparison to prevent timing attacks
  const encoder = new TextEncoder();
  const inputBuf = encoder.encode(pin);
  const correctBuf = encoder.encode((process.env.APP_PIN || "").padEnd(4).slice(0, 4));

  const { timingSafeEqual } = await import("crypto");
  if (!timingSafeEqual(inputBuf, correctBuf)) {
    return { error: "Incorrect PIN" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_AUTH_EMAIL!,
    password: process.env.SUPABASE_AUTH_PASSWORD!,
  });

  if (error) {
    console.error("Supabase sign-in failed:", error.message);
    return { error: "Something went wrong. Try again." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
