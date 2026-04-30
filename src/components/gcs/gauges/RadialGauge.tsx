import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  label: string;
  value: number;
  unit?: string;
  minimum?: number;
  maximum: number;
  warningThreshold?: number;
  inverted?: boolean;
  precision?: number;
  size?: number;
  className?: string;
}

export function RadialGauge({
  label,
  value,
  unit = "",
  minimum = 0,
  maximum,
  warningThreshold,
  inverted = false,
  precision = 0,
  size = 80,
  className,
}: RadialGaugeProps) {
  const percentage = Math.max(
    0,
    Math.min(1, (value - minimum) / (maximum - minimum)),
  );
  const isWarning =
    warningThreshold != null &&
    (inverted ? value <= warningThreshold : value >= warningThreshold);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className={cn("panel p-3 flex flex-col items-center", className)}>
      <div className="hud-label mb-2">{label}</div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--surface-elevated)"
            strokeWidth="8"
            fill="transparent"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={isWarning ? "var(--destructive)" : "var(--primary)"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease, stroke 0.3s",
            }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-mono font-bold tabular-nums",
              isWarning && "text-destructive",
            )}
          >
            {value.toFixed(precision)}
          </span>

          <span className="text-xs text-muted-foreground uppercase">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
