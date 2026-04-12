interface BadgeProps {
  children: React.ReactNode;
  colorClass?: string;
  size?: "sm" | "md";
}

export function Badge({ children, colorClass = "bg-bg-elevated text-text-muted", size = "md" }: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
