import { cn } from "@/lib/utils";
import type { FriendlyDrone } from "@/types/drone";
import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Crosshair,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DroneListItemProps {
  drone: FriendlyDrone;
  selected: boolean;
  onClick: () => void;
}

function BatteryIcon({ value }: { value: number }) {
  const baseClass = "w-3.5 h-3.5";

  console.log("value", value);

  if (value < 15) {
    return <BatteryWarning className={cn(baseClass, "text-destructive")} />;
  }

  if (value < 35) {
    return <BatteryLow className={cn(baseClass, "text-warning")} />;
  }

  if (value < 70) {
    return <BatteryMedium className={cn(baseClass, "text-chart-1")} />;
  }

  return <BatteryFull className={cn(baseClass, "text-success")} />;
}

const statusDot: Record<FriendlyDrone["status"], string> = {
  idle: "bg-muted-foreground",
  active: "bg-success",
  engaging: "bg-primary animate-blink",
  lost: "bg-destructive",
  removed: "bg-destructive",
};

export function DroneListItem({
  drone,
  selected,
  onClick,
}: DroneListItemProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "w-full text-left border transition-all group h-auto py-2.5",
        "hover:bg-sidebar-accent hover:border-border",
        {
          "bg-sidebar-accent border-primary/60 ember-glow": selected,
          "bg-transparent border-transparent": !selected,
        },
      )}
    >
      <div className="flex items-center gap-2.5 w-full">
        <div className="relative">
          <Plane
            className={cn(
              "w-4 h-4",
              drone.status === "engaging" ? "text-primary" : "text-foreground",
            )}
            style={{ transform: `rotate(${drone.azimuth - 45}deg)` }}
          />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
              statusDot[drone.status],
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-muted-foreground font-mono text-xs font-semibold tracking-wide truncate">
              {drone.callsign}
            </div>

            <div className="hud-label text-xs">{drone.id}</div>
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <BatteryIcon value={drone.battery} />

              <span className="tabular-nums">{drone.battery.toFixed(0)}%</span>
            </span>

            <span className="tabular-nums">{drone.altitude.toFixed(0)}m</span>

            <span className="tabular-nums">{drone.speed.toFixed(0)}m/s</span>

            {drone.targetId && <Crosshair className="w-3 h-3 text-primary" />}
          </div>
        </div>
      </div>
    </Button>
  );
}
