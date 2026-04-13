"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7A3347]"
      aria-label="Go back"
    >
      ←
    </button>
  );
}
