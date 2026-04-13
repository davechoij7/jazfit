import { type HTMLAttributes, type CSSProperties } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
  glass?: boolean;
}

const GLASS_STYLE: CSSProperties = {
  background: "rgba(240, 196, 206, 0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
};

export function Card({ padding = "md", glass = false, className = "", children, style, ...props }: CardProps) {
  const paddingStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`${glass ? "" : "bg-bg-card border border-border"} rounded-2xl ${paddingStyles[padding]} ${className}`}
      style={glass ? { ...GLASS_STYLE, ...style } : style}
      {...props}
    >
      {children}
    </div>
  );
}
