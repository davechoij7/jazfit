"use client";

import { useEffect, useRef, useState } from "react";

interface NumberInputProps {
  value: number | null;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
}

export function NumberInput({
  value,
  onChange,
  step = 5,
  min = 0,
  max = 999,
  label,
  unit,
}: NumberInputProps) {
  const displayValue = value ?? 0;

  // Local draft string so she can type freely; commit to parent on blur/Enter.
  const [draft, setDraft] = useState<string>(String(displayValue));
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync with external updates (stepper taps, set switches)
  // while she's not actively typing in it.
  useEffect(() => {
    if (!editing) setDraft(String(displayValue));
  }, [displayValue, editing]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const decrement = () => onChange(clamp(displayValue - step));
  const increment = () => onChange(clamp(displayValue + step));

  const commit = () => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (draft.trim() === "" || Number.isNaN(parsed)) {
      // Revert to the last good value — no spurious 0.
      setDraft(String(displayValue));
      return;
    }
    const next = clamp(parsed);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      {label && <span className="text-[10px] text-text-dim tracking-wide">{label}</span>}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={decrement}
          className="w-8 h-10 rounded-lg bg-bg-elevated text-text-primary text-lg font-bold
                     flex items-center justify-center active:bg-bg-card select-none touch-manipulation"
        >
          −
        </button>
        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={draft}
            onFocus={(e) => {
              setEditing(true);
              e.currentTarget.select();
            }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                inputRef.current?.blur();
              }
            }}
            aria-label={label}
            className="w-full h-full bg-transparent text-center text-base font-bold text-text-primary
                       tabular-nums focus:outline-none select-none touch-manipulation"
          />
          {unit && <span className="text-[10px] text-text-dim ml-0.5">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={increment}
          className="w-8 h-10 rounded-lg bg-bg-elevated text-text-primary text-lg font-bold
                     flex items-center justify-center active:bg-bg-card select-none touch-manipulation"
        >
          +
        </button>
      </div>
    </div>
  );
}
