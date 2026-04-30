import { cn } from "@/lib/utils";

interface LinearGaugeProps {
  label: string;
  value: number;
  unit?: string;
  minimum?: number;
  maximum: number;
  warningThreshold?: number;
  inverted?: boolean;
  precision?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function LinearGauge({
  label,
  value,
  unit = "",
  minimum = 0,
  maximum,
  warningThreshold,
  inverted = false,
  precision = 0,
  orientation = "horizontal",
  className,
}: LinearGaugeProps) {
  const percentage = Math.max(
    0,
    Math.min(1, (value - minimum) / (maximum - minimum)),
  );
  const isWarning =
    warningThreshold != null &&
    (inverted ? value <= warningThreshold : value >= warningThreshold);

  return (
    <div className={cn("panel p-3 flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center">
        <div className="hud-label">{label}</div>
        <div
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            isWarning && "text-destructive",
          )}
        >
          {value.toFixed(precision)}
          <span className="text-[10px] ml-0.5 text-muted-foreground uppercase">
            {unit}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "relative bg-surface-elevated rounded-sm overflow-hidden",
          orientation === "horizontal" ? "h-1.5 w-full" : "w-1.5 h-32 self-center",
        )}
      >
        <div
          className={cn(
            "absolute bottom-0 left-0 transition-all duration-500",
            isWarning ? "bg-destructive" : "bg-primary",
            orientation === "horizontal" ? "top-0 h-full" : "right-0 w-full",
          )}
          style={{
            [orientation === "horizontal" ? "width" : "height"]: `${percentage * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
