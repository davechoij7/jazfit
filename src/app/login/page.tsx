"use client";

import { useState, useRef, useCallback } from "react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError(null);

    if (digits.length === 4) {
      setIsLoading(true);
      const formData = new FormData();
      formData.set("pin", digits);
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setShake(true);
        setPin("");
        setIsLoading(false);
        setTimeout(() => {
          setShake(false);
          inputRef.current?.focus();
        }, 400);
      }
    }
  }, []);

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center px-6"
      onClick={() => inputRef.current?.focus()}
    >
      <h1 className="text-[32px] font-display font-normal text-accent mb-2">
        JazFit
      </h1>
      <p className="text-text-muted mb-10">Enter your PIN</p>

      <div
        className="bg-[rgba(240,196,206,0.55)] backdrop-blur-[20px]
                    border border-white/25 rounded-[20px]
                    px-10 py-8"
      >
        <div
          className={`flex justify-center gap-4 ${shake ? "animate-shake" : ""}`}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-150
                ${
                  pin.length > i
                    ? "bg-accent scale-110"
                    : "border-2 border-border"
                }`}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          autoFocus
          value={pin}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute opacity-0 w-0 h-0"
          disabled={isLoading}
          maxLength={4}
        />
      </div>

      {error && <p className="text-error text-sm mt-6">{error}</p>}

      {isLoading && (
        <p className="text-text-muted text-sm mt-6">Signing in...</p>
      )}
    </main>
  );
}
