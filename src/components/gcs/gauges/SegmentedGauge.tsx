import { cn } from "@/lib/utils";

interface SegmentedGaugeProps {
  label: string;
  value: number;
  unit?: string;
  minimum?: number;
  maximum: number;
  warningThreshold?: number;
  inverted?: boolean;
  precision?: number;
  segments?: number;
  className?: string;
}

export function SegmentedGauge({
  label,
  value,
  unit = "",
  minimum = 0,
  maximum,
  warningThreshold,
  inverted = false,
  precision = 0,
  segments = 12,
  className,
}: SegmentedGaugeProps) {
  const percentage = Math.max(
    0,
    Math.min(1, (value - minimum) / (maximum - minimum)),
  );
  const activeSegments = Math.round(percentage * segments);
  const isWarning =
    warningThreshold != null &&
    (inverted ? value <= warningThreshold : value >= warningThreshold);

  return (
    <div className={cn("panel p-3 flex flex-col gap-2", className)}>
      <div className="flex justify-between items-baseline">
        <div className="hud-label">{label}</div>
        <div
          className={cn(
            "font-mono font-bold tabular-nums",
            isWarning && "text-destructive",
          )}
        >
          {value.toFixed(precision)}
          <span className="text-[10px] ml-0.5 text-muted-foreground uppercase">
            {unit}
          </span>
        </div>
      </div>
      <div className="flex gap-1 h-2.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-[1px] transition-colors duration-300",
              i < activeSegments
                ? isWarning
                  ? "bg-destructive"
                  : "bg-primary"
                : "bg-surface-elevated",
            )}
          />
        ))}
      </div>
    </div>
  );
}
