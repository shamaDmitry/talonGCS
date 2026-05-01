import { cn } from "@/lib/utils";
import type { FriendlyDrone } from "@/types/drone";
import {
  Badge,
  Box,
  Crosshair,
  Gauge,
  Navigation,
  Radio,
  Zap,
} from "lucide-react";

const DronePopup = ({ data }: { data: FriendlyDrone }) => {
  const statusConfig = {
    idle: { label: "IDLE", color: "text-muted-foreground", bg: "bg-muted" },
    active: {
      label: "ACTIVE",
      color: "text-success",
      bg: "bg-success/15 border-success/30",
    },
    engaging: {
      label: "ENGAGING",
      color: "text-primary",
      bg: "bg-primary/20 border-primary/40 animate-blink",
    },
    lost: {
      label: "LOST",
      color: "text-destructive",
      bg: "bg-destructive/20 border-destructive/40",
    },
    removed: {
      label: "DOWN",
      color: "text-destructive",
      bg: "bg-destructive/20 border-destructive/40",
    },
  };

  const status = statusConfig[data.status] || statusConfig.idle;

  return (
    <div className="w-56 overflow-hidden font-mono select-none">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border">
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight truncate">
            {data.callsign}
          </div>

          <div className="text-[10px] text-muted-foreground leading-none">
            {data.id}
          </div>
        </div>

        <Badge
          className={cn(
            "text-xs px-1.5 py-0 h-4 border shrink-0",
            status.bg,
            status.color,
          )}
        >
          {status.label}
        </Badge>
      </div>

      <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="flex items-center gap-2">
          <Zap
            className={cn(
              "w-3.5 h-3.5",
              data.battery < 20 ? "text-destructive" : "text-success",
            )}
          />

          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase leading-none">
              Batt
            </span>

            <span className="text-xs font-bold leading-none">
              {data.battery.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-info" />

          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase leading-none">
              Sig
            </span>

            <span className="text-xs font-bold leading-none">
              {data.signal.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-primary" />

          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase leading-none">
              Alt
            </span>
            <span className="text-xs font-bold leading-none">
              {data.altitude.toFixed(0)}m
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-warning" />

          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase leading-none">
              Spd
            </span>

            <span className="text-xs font-bold leading-none">
              {data.speed.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 py-1.5 bg-muted/10 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Box className="w-3 h-3 text-muted-foreground shrink-0" />

          <span className="text-[10px] text-muted-foreground uppercase font-medium truncate">
            {data.payload}
          </span>
        </div>

        {data.status === "engaging" && (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Crosshair className="w-3 h-3 text-primary animate-pulse" />

            <span className="text-[10px] text-primary font-bold">LOCK</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DronePopup;
