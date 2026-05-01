import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Plane, Radio, Target, Zap } from "lucide-react";
import type { EnemyDrone, FriendlyDrone } from "@/types/drone";
import { TelemetryChart } from "@/components/gcs/TelemetryChart";
import { RadialGauge } from "./gauges";

interface Props {
  drone: FriendlyDrone | null;
  enemy: EnemyDrone | null;
  onAttack: () => void;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);

  return `${m}:${String(ss).padStart(2, "0")}`;
}

const statusBadge: Record<
  FriendlyDrone["status"],
  { label: string; className: string }
> = {
  idle: { label: "IDLE", className: "bg-muted text-muted-foreground" },
  active: {
    label: "ACTIVE",
    className: "bg-success/15 text-success border border-success/40",
  },
  engaging: {
    label: "ENGAGING",
    className:
      "bg-primary/20 text-primary border border-primary/50 animate-blink",
  },
  lost: {
    label: "LOST",
    className:
      "bg-destructive/20 text-destructive border border-destructive/50",
  },
  removed: {
    label: "DOWN",
    className:
      "bg-destructive/20 text-destructive border border-destructive/50",
  },
};

export function DroneDetails({ drone, enemy, onAttack }: Props) {
  if (!drone) {
    return (
      <div className="h-full grid place-items-center text-center p-6">
        <div>
          <Plane className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />

          <div className="hud-label">No drone selected</div>

          <div className="text-xs text-muted-foreground mt-1 max-w-55">
            Pick a unit from the fleet to view live telemetry and engage
            targets.
          </div>
        </div>
      </div>
    );
  }

  const status = statusBadge[drone.status];
  const canAttack =
    enemy &&
    drone.status !== "lost" &&
    drone.status !== "removed" &&
    drone.status !== "engaging";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border bg-surface/40">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold tracking-wide">
                {drone.callsign}
              </h2>

              <Badge
                className={`${status.className} font-mono text-xs px-1.5 py-0`}
              >
                {status.label}
              </Badge>
            </div>

            <div className="hud-label mt-0.5">
              {drone.id} · {drone.payload}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Radio className="w-3.5 h-3.5" />

            <span className="font-mono text-xs tabular-nums">
              {drone.signal.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3">
        <RadialGauge
          label="Altitude"
          value={drone.altitude}
          unit="M"
          maximum={400}
        />

        <RadialGauge
          label="Speed"
          value={drone.speed}
          unit="M/S"
          maximum={32}
        />

        <RadialGauge
          label="Battery"
          value={drone.battery}
          unit="%"
          maximum={100}
        />

        {/* <Gauge
          label="Battery"
          value={drone.battery}
          unit="%"
          maximum={100}
          warningThreshold={20}
          inverted
        /> */}
      </div>

      <div className="px-3 grid grid-cols-2 gap-2">
        {[
          ["FLIGHT TIME", fmtTime(drone.flightTime)],
          ["AZIMUTH", `${drone.azimuth.toFixed(0)}°`],
          ["LATITUDE", drone.latitude.toFixed(5)],
          ["LONGITUDE", drone.longitude.toFixed(5)],
        ].map(([key, value]) => (
          <div key={key} className="panel px-2.5 py-2">
            <div className="hud-label">{key}</div>

            <div className="hud-value text-sm mt-0.5">{value}</div>
          </div>
        ))}
      </div>

      <div className="px-3 pt-3">
        <div className="panel p-2 h-44">
          <div className="flex items-center justify-between px-1 pb-1">
            <div className="hud-label">TELEMETRY · 60s</div>

            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-sm" /> ALT
              </span>

              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-info rounded-sm" /> SPD
              </span>
            </div>
          </div>

          <div className="h-[calc(100%-22px)]">
            <TelemetryChart drone={drone} />
          </div>
        </div>
      </div>

      <div className="p-3 mt-auto border-t border-border bg-surface/40">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-muted-foreground" />

          <div className="hud-label">ENGAGEMENT</div>
        </div>

        {enemy ? (
          <div className="panel px-2.5 py-2 mb-2 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-hostile" />

            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs font-bold">{enemy.id}</div>

              <div className="font-mono text-xs text-muted-foreground">
                {enemy.latitude.toFixed(4)}, {enemy.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground mb-2">
            Tap a hostile contact on the map to acquire a target.
          </div>
        )}

        <Button
          onClick={onAttack}
          disabled={!canAttack}
          size="lg"
          className="w-full bg-linear-to-r from-primary to-primary-glow hover:opacity-90 text-primary-foreground font-mono font-bold tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" />

          {drone.status === "engaging" ? "ENGAGING…" : "ATTACK"}
        </Button>
      </div>
    </div>
  );
}
