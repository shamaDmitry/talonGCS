import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type RenderableText,
  type TooltipValueType,
} from "recharts";
import type { FriendlyDrone, TelemetrySample } from "@/types/drone";

interface TelemetryChartProps {
  drone: FriendlyDrone | null;
}

const MAXIMUM_DATA_POINTS = 60;

export function TelemetryChart({ drone }: TelemetryChartProps) {
  const [data, setData] = useState<TelemetrySample[]>([]);
  const lastDroneIdReference = useRef<string | null>(null);

  useEffect(() => {
    if (!drone) {
      lastDroneIdReference.current = null;

      return;
    }

    const isNewDrone = lastDroneIdReference.current !== drone.id;

    if (isNewDrone) {
      lastDroneIdReference.current = drone.id;
    }

    const nextSample: TelemetrySample = {
      timestamp: Date.now(),
      altitude: drone.altitude,
      speed: drone.speed,
      battery: drone.battery,
    };

    setData((previousData) => {
      const baseData = isNewDrone ? [] : previousData;
      const updatedData = [...baseData, nextSample];

      return updatedData.slice(-MAXIMUM_DATA_POINTS);
    });
  }, [drone]);

  if (!drone) {
    return (
      <div className="h-full grid place-items-center text-muted-foreground text-xs font-mono">
        NO SIGNAL
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" className="overflow-hidden">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientAltitude" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />

            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>

          <linearGradient id="gradientSpeed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--info)" stopOpacity={0.4} />

            <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="timestamp"
          tickFormatter={() => ""}
          stroke="var(--border)"
          tick={false}
          axisLine={{ stroke: "var(--border)" }}
        />

        <YAxis
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
          width={36}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          }}
          labelFormatter={() => ""}
          formatter={(value: RenderableText | TooltipValueType, name) => [
            typeof value === "number" ? value.toFixed(1) : String(value),
            name,
          ]}
        />

        <Area
          type="monotone"
          dataKey="altitude"
          name="Altitude"
          stroke="var(--primary)"
          strokeWidth={1.5}
          fill="url(#gradientAltitude)"
          isAnimationActive={false}
        />

        <Area
          type="monotone"
          dataKey="speed"
          name="Speed"
          stroke="var(--info)"
          strokeWidth={1.5}
          fill="url(#gradientSpeed)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
