"use client";

interface Props {
  show: boolean;
  onLogClick: () => void;
}

export function MeasurementPromptBanner({ show, onLogClick }: Props) {
  if (!show) return null;

  return (
    <div
      className="rounded-2xl border p-4 mb-4 flex items-center justify-between gap-3"
      style={{
        background: "rgba(240, 196, 206, 0.45)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "#E8A0AD",
        boxShadow: "0 2px 12px rgba(122, 51, 71, 0.06)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary leading-snug">
          Time to check in
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          Log your measurements to track progress
        </p>
      </div>
      <button
        className="flex-shrink-0 min-h-12 px-4 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#C4808E" }}
        onClick={onLogClick}
      >
        Log now
      </button>
    </div>
  );
}
