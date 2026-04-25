"use client";

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

  const decrement = () => {
    const next = Math.max(min, displayValue - step);
    onChange(next);
  };

  const increment = () => {
    const next = Math.min(max, displayValue + step);
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
          <span className="text-base font-bold text-text-primary tabular-nums">{displayValue}</span>
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
