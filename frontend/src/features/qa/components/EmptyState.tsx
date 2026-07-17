import { CheckSquare } from "lucide-react";

interface EmptyStateProps {
  /** Wrapper classes — differ slightly between the table, trend chart and
   *  department breakdown placements in the original markup. */
  className?: string;
  iconSize?: number;
  message?: string;
  textClassName?: string;
}

export function EmptyState({
  className = "flex flex-col items-center justify-center p-12 text-slate-400",
  iconSize = 32,
  message = "No QA Activities Found",
  textClassName = "text-sm font-medium",
}: EmptyStateProps) {
  return (
    <div className={className}>
      <CheckSquare size={iconSize} className="mb-2 text-slate-300" />
      <p className={textClassName}>{message}</p>
    </div>
  );
}
