import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";

import type { EnemyDrone, FriendlyDrone } from "@/types/drone";
import "leaflet/dist/leaflet.css";
import EnemyTarget from "@/components/gcs/map/EnemyTarget";
import FriendlyDron from "@/components/gcs/map/FriendlyDron";
import DronePopup from "@/components/gcs/map/DronePopup";

interface TacticalMapProps {
  friendlies: FriendlyDrone[];
  enemies: EnemyDrone[];
  selectedFriendlyId: string | null;
  selectedEnemyId: string | null;
  onSelectFriendly: (id: string) => void;
  onSelectEnemy: (id: string) => void;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return null;
}

function PopupManager({ friendlies }: { friendlies: FriendlyDrone[] }) {
  const map = useMap();

  const engagingCount = friendlies.filter(
    (d) => d.status === "engaging",
  ).length;

  useEffect(() => {
    if (engagingCount > 0) {
      map.closePopup();
    }
  }, [engagingCount, map]);

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
        <PopupManager friendlies={friendlies} />

        {friendlies.map((drone) => {
          return (
            <Marker
              key={drone.id}
              position={[drone.latitude, drone.longitude]}
              icon={FriendlyDron(drone, selectedFriendlyId === drone.id)}
              eventHandlers={{ click: () => onSelectFriendly(drone.id) }}
            >
              <Popup>
                <DronePopup data={drone} />
              </Popup>
            </Marker>
          );
        })}

        {enemies.map((enemyDrone) => (
          <Marker
            key={enemyDrone.id}
            position={[enemyDrone.latitude, enemyDrone.longitude]}
            icon={EnemyTarget(enemyDrone, selectedEnemyId === enemyDrone.id)}
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
