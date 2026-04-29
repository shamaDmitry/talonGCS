import { cn } from "@/lib/utils";

interface GaugeProps {
  label: string;
  value: number;
  unit?: string;
  minimum?: number;
  maximum: number;
  warningThreshold?: number; // threshold for warning (low for battery, high for speed)
  inverted?: boolean; // true for battery-style (low = bad)
  precision?: number;
}

export function Gauge({
  label,
  value,
  unit = "",
  minimum = 0,
  maximum,
  warningThreshold,
  inverted = false,
  precision = 0,
}: GaugeProps) {
  const percentage = Math.max(
    0,
    Math.min(1, (value - minimum) / (maximum - minimum)),
  );
  const rotationAngle = -120 + percentage * 240; // -120 degrees to +120 degrees

  const isWarning =
    warningThreshold != null &&
    (inverted ? value <= warningThreshold : value >= warningThreshold);

  const strokeColor = isWarning ? "var(--destructive)" : "var(--primary)";

  const mainRadius = 38;
  const circumference = 2 * Math.PI * mainRadius;
  const arcLength = (240 / 360) * circumference;
  const fillLength = percentage * arcLength;

  const centerX = 50;
  const centerY = 50;

  const trackStrokeWidth = 6;
  const needleStrokeWidth = 2;
  const needleBaseRadius = 3;
  const needleTipY = 18;

  return (
    <div className="panel p-3 flex flex-col items-center">
      <div className="hud-label mb-1">{label}</div>

      <div className="relative w-full aspect-square max-w-30">
        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-30deg]">
          {/* Track */}
          <circle
            cx={centerX}
            cy={centerY}
            r={mainRadius}
            fill="none"
            stroke="var(--surface-elevated)"
            strokeWidth={trackStrokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Fill */}
          <circle
            cx={centerX}
            cy={centerY}
            r={mainRadius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={trackStrokeWidth}
            strokeDasharray={`${fillLength} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.3s" }}
          />

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: `${centerX}px ${centerY}px`,
              transition: "transform 0.5s",
            }}
          >
            <line
              x1={centerX}
              y1={centerY}
              x2={centerX}
              y2={needleTipY}
              stroke={strokeColor}
              strokeWidth={needleStrokeWidth}
              strokeLinecap="round"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={needleBaseRadius}
              fill={strokeColor}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
          <div
            className={cn(
              "font-mono font-bold text-xl tabular-nums",
              isWarning && "text-destructive",
            )}
          >
            {value.toFixed(precision)}
          </div>

          <div className="hud-label text-xs">{unit}</div>
        </div>
      </div>
    </div>
  );
}
