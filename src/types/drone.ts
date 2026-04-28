export type DroneStatus = "idle" | "active" | "engaging" | "lost" | "removed";

export interface FriendlyDrone {
  id: string;
  callsign: string;
  status: DroneStatus;
  lat: number;
  lng: number;
  alt: number; // meters
  speed: number; // m/s
  battery: number; // %
  flightTime: number; // seconds
  azimuth: number; // degrees 0-360
  signal: number; // %
  payload: string;
  targetId?: string | null;
}

export interface EnemyDrone {
  id: string;
  lat: number;
  lng: number;
  direction: number;
  status: "active" | "lost" | "removed";
}

export interface TelemetrySample {
  t: number;
  alt: number;
  speed: number;
  battery: number;
}
