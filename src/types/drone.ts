export type DroneStatus = "idle" | "active" | "engaging" | "lost" | "removed";

export interface FriendlyDrone {
  id: string;
  callsign: string;
  status: DroneStatus;
  latitude: number;
  longitude: number;
  altitude: number; // meters
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
  latitude: number;
  longitude: number;
  direction: number;
  status: "active" | "lost" | "removed";
}

export interface TelemetrySample {
  timestamp: number;
  altitude: number;
  speed: number;
  battery: number;
}
