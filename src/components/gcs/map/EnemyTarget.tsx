import type { EnemyDrone } from "@/types/drone";
import L from "leaflet";

const EnemyTarget = (drone: EnemyDrone, selected: boolean) => {
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
};

export default EnemyTarget;
