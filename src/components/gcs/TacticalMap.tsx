import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { EnemyDrone, FriendlyDrone } from "@/types/drone";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

interface TacticalMapProps {
  friendlies: FriendlyDrone[];
  enemies: EnemyDrone[];
  selectedFriendlyId: string | null;
  selectedEnemyId: string | null;
  onSelectFriendly: (id: string) => void;
  onSelectEnemy: (id: string) => void;
}

function friendlyIcon(drone: FriendlyDrone, selected: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],

    html: `
      <div class="relative w-7 h-7 ">
        <div class="${cn("absolute inset-0 flex items-center justify-center", {
          "scale-125": selected,
        })}" style="transform: rotate(${drone.azimuth}deg)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${cn(
            "text-success",
            {
              "text-info": selected,
            },
          )}">
            <path d="M12 2 L4 22 L12 17 L20 22 Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    `,
  });
}

function enemyIcon(drone: EnemyDrone, selected: boolean) {
  const color = "var(--hostile)";
  const ring = selected
    ? `box-shadow: 0 0 0 2px var(--primary), 0 0 14px var(--primary);`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `
      <div style="width:30px;height:30px;position:relative;${ring} border-radius:50%;">
        <div style="position:absolute;inset:4px;border:1.5px solid ${color};border-radius:50%;"></div>
        <div style="position:absolute;inset:9px;background:${color};border-radius:50%;box-shadow:0 0 10px ${color};"></div>
        <div style="position:absolute;inset:0;border:1px dashed ${color};border-radius:50%;animation:ping-soft 2s infinite;"></div>
        <svg style="position:absolute;left:50%;top:-4px;transform:translateX(-50%) rotate(${drone.direction}deg);transform-origin:50% 19px;" width="10" height="10" viewBox="0 0 10 10">
          <path d="M5 0 L9 8 L5 6 L1 8 Z" fill="${color}"/>
        </svg>
      </div>
    `,
  });
}

function FlyToSelection({
  id,
  getPos,
}: {
  id: string | null;
  getPos: () => [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!id) return;

    const pos = getPos();

    if (!pos) return;

    map.flyTo(pos, Math.max(map.getZoom(), 13), { duration: 0.8 });
    // Only re-run when the SELECTION changes, not on every coord tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return null;
}

export function TacticalMap({
  friendlies,
  enemies,
  selectedFriendlyId,
  selectedEnemyId,
  onSelectFriendly,
  onSelectEnemy,
}: TacticalMapProps) {
  const selectedFriendly =
    friendlies.find((drone) => {
      return drone.id === selectedFriendlyId;
    }) ?? null;

  const selectedEnemy =
    enemies.find((drone) => drone.id === selectedEnemyId) ?? null;

  const engagementLine: [number, number][] | null =
    selectedFriendly &&
    selectedFriendly.status === "engaging" &&
    selectedFriendly.targetId
      ? (() => {
          const tgt = enemies.find(
            (drone) => drone.id === selectedFriendly.targetId,
          );

          return tgt
            ? [
                [selectedFriendly.latitude, selectedFriendly.longitude],
                [tgt.latitude, tgt.longitude],
              ]
            : null;
        })()
      : null;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[50.4501, 30.5234]}
        zoom={12}
        scrollWheelZoom
        zoomControl
        className="w-full h-full"
        style={{ background: "hsl(var(--background))" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelection
          id={selectedFriendlyId}
          getPos={() =>
            selectedFriendly
              ? [selectedFriendly.latitude, selectedFriendly.longitude]
              : null
          }
        />

        {friendlies.map((drone) => (
          <Marker
            key={drone.id}
            position={[drone.latitude, drone.longitude]}
            icon={friendlyIcon(drone, selectedFriendlyId === drone.id)}
            eventHandlers={{ click: () => onSelectFriendly(drone.id) }}
          />
        ))}

        {enemies.map((enemyDrone) => (
          <Marker
            key={enemyDrone.id}
            position={[enemyDrone.latitude, enemyDrone.longitude]}
            icon={enemyIcon(enemyDrone, selectedEnemyId === enemyDrone.id)}
            eventHandlers={{ click: () => onSelectEnemy(enemyDrone.id) }}
          />
        ))}

        {engagementLine && (
          <Polyline
            positions={engagementLine}
            pathOptions={{
              color: "hsl(14, 79%, 57%)",
              weight: 2,
              dashArray: "6 6",
              opacity: 0.9,
            }}
          />
        )}
      </MapContainer>

      <div className="absolute top-3 left-20 z-400 panel px-2.5 py-1.5 flex items-center gap-2 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-blink" />

        <span className="hud-label">
          LIVE FEED · {friendlies.length} FR · {enemies.length} HOSTILE
        </span>
      </div>

      {selectedEnemy && (
        <div className="absolute bottom-3 left-3 z-400 panel px-3 py-2 max-w-55">
          <div className="hud-label text-hostile">TARGET LOCK</div>

          <div className="font-mono text-sm font-bold mt-0.5">
            {selectedEnemy.id}
          </div>

          <div className="font-mono text-xs text-muted-foreground mt-1 space-y-0.5">
            <div>LAT {selectedEnemy.latitude.toFixed(5)}</div>

            <div>LNG {selectedEnemy.longitude.toFixed(5)}</div>

            <div>DIR {selectedEnemy.direction.toFixed(0)}°</div>
          </div>
        </div>
      )}
    </div>
  );
}
