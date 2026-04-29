/**
 * Socket service stub.
 * Mocks a real-time WS feed for friendly drones + enemy contacts.
 * Swap `connect()` for a real WebSocket later — public API stays the same.
 */
import type { EnemyDrone, FriendlyDrone } from "@/types/drone";

type Listener<T> = (data: T) => void;

const BASE_COORDINATES: [number, number] = [50.4501, 30.5234]; // Kyiv center

const CALLSIGNS = [
  "Hawk",
  "Falcon",
  "Raven",
  "Viper",
  "Cobra",
  "Talon",
  "Wraith",
  "Spectre",
  "Nomad",
  "Phantom",
  "Echo",
  "Saber",
];

const PAYLOADS = ["FPV-1.5kg", "Recon", "FPV-3kg", "Relay"];

function getRandomNumber(minimum: number, maximum: number) {
  return Math.random() * (maximum - minimum) + minimum;
}

function jitterCoordinate(baseValue: number, amount: number) {
  return baseValue + (Math.random() - 0.5) * amount;
}

function makeFriendlyDrone(index: number): FriendlyDrone {
  return {
    id: `FR-${String(index + 1).padStart(2, "0")}`,
    callsign: `${CALLSIGNS[index % CALLSIGNS.length]}-${index + 1}`,
    status: index % 7 === 0 ? "idle" : "active",
    latitude: jitterCoordinate(BASE_COORDINATES[0], 0.06),
    longitude: jitterCoordinate(BASE_COORDINATES[1], 0.08),
    altitude: getRandomNumber(80, 320),
    speed: getRandomNumber(8, 28),
    battery: getRandomNumber(35, 100),
    flightTime: Math.floor(getRandomNumber(60, 1800)),
    azimuth: getRandomNumber(0, 360),
    signal: getRandomNumber(60, 100),
    payload: PAYLOADS[index % PAYLOADS.length],
    targetId: null,
  };
}

function makeEnemyDrone(index: number): EnemyDrone {
  return {
    id: `TRK-${index + 1}`,
    latitude: jitterCoordinate(BASE_COORDINATES[0], 0.08),
    longitude: jitterCoordinate(BASE_COORDINATES[1], 0.1),
    direction: getRandomNumber(0, 360),
    status: "active",
  };
}

class GcsSocket {
  private friendlies: FriendlyDrone[] = Array.from({ length: 12 }, (_, index) =>
    makeFriendlyDrone(index),
  );
  private enemies: EnemyDrone[] = Array.from({ length: 8 }, (_, index) =>
    makeEnemyDrone(index),
  );
  private friendlyListeners = new Set<Listener<FriendlyDrone[]>>();
  private enemyListeners = new Set<Listener<EnemyDrone[]>>();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private engagements = new Map<string, { targetId: string; timeToLive: number }>();

  connect() {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => this.processTick(), 1000);

    // emit immediately
    queueMicrotask(() => {
      this.emitFriendlyDrones();
      this.emitEnemyDrones();
    });
  }

  disconnect() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = null;
  }

  onFriendly(callback: Listener<FriendlyDrone[]>) {
    this.friendlyListeners.add(callback);
    callback(this.getFriendlySnapshot());
    return () => this.friendlyListeners.delete(callback);
  }

  onEnemy(callback: Listener<EnemyDrone[]>) {
    this.enemyListeners.add(callback);
    callback(this.getEnemySnapshot());
    return () => this.enemyListeners.delete(callback);
  }

  /** User-issued attack command */
  attack(friendlyId: string, enemyId: string) {
    const friendly = this.friendlies.find((drone) => drone.id === friendlyId);
    const enemy = this.enemies.find((drone) => drone.id === enemyId);
    if (!friendly || !enemy || friendly.status === "lost" || friendly.status === "removed") return;
    friendly.status = "engaging";
    friendly.targetId = enemyId;
    this.engagements.set(friendlyId, { targetId: enemyId, timeToLive: 6 });
    this.emitFriendlyDrones();
  }

  private getFriendlySnapshot() {
    return this.friendlies.map((drone) => ({ ...drone }));
  }
  private getEnemySnapshot() {
    return this.enemies.map((drone) => ({ ...drone }));
  }

  private emitFriendlyDrones() {
    const snapshot = this.getFriendlySnapshot();
    this.friendlyListeners.forEach((callback) => callback(snapshot));
  }
  private emitEnemyDrones() {
    const snapshot = this.getEnemySnapshot();
    this.enemyListeners.forEach((callback) => callback(snapshot));
  }

  private processTick() {
    // Move friendlies
    this.friendlies.forEach((drone) => {
      if (drone.status === "lost" || drone.status === "removed") return;
      const heading = (drone.azimuth * Math.PI) / 180;
      const distance = (drone.speed / 111000) * 0.8;
      drone.latitude += Math.cos(heading) * distance;
      drone.longitude += Math.sin(heading) * distance;
      drone.azimuth = (drone.azimuth + getRandomNumber(-6, 6) + 360) % 360;
      drone.altitude = Math.max(60, Math.min(400, drone.altitude + getRandomNumber(-4, 4)));
      drone.speed = Math.max(5, Math.min(32, drone.speed + getRandomNumber(-1, 1)));
      if (drone.status === "active" || drone.status === "engaging") {
        drone.battery = Math.max(0, drone.battery - getRandomNumber(0.05, 0.2));
        drone.flightTime += 1;
      }
      drone.signal = Math.max(40, Math.min(100, drone.signal + getRandomNumber(-3, 3)));
    });

    // Move enemies
    this.enemies.forEach((enemy) => {
      if (enemy.status !== "active") return;
      const heading = (enemy.direction * Math.PI) / 180;
      const distance = 0.00012;
      enemy.latitude += Math.cos(heading) * distance;
      enemy.longitude += Math.sin(heading) * distance;
      enemy.direction = (enemy.direction + getRandomNumber(-4, 4) + 360) % 360;
    });

    // Process engagements
    for (const [friendlyId, engagement] of this.engagements) {
      engagement.timeToLive -= 1;
      const friendly = this.friendlies.find((drone) => drone.id === friendlyId);
      const enemy = this.enemies.find((drone) => drone.id === engagement.targetId);
      if (!friendly || !enemy) {
        this.engagements.delete(friendlyId);
        continue;
      }
      // home toward target
      const deltaLongitude = enemy.longitude - friendly.longitude;
      const deltaLatitude = enemy.latitude - friendly.latitude;
      const targetAzimuth = ((Math.atan2(deltaLongitude, deltaLatitude) * 180) / Math.PI + 360) % 360;
      friendly.azimuth = targetAzimuth;
      friendly.speed = Math.min(32, friendly.speed + 1.5);
      const closeDistance = Math.hypot(deltaLongitude, deltaLatitude);
      friendly.latitude += deltaLatitude * 0.18;
      friendly.longitude += deltaLongitude * 0.18;

      if (engagement.timeToLive <= 0 || closeDistance < 0.0008) {
        // BOOM
        enemy.status = "removed";
        friendly.status = "removed";
        this.engagements.delete(friendlyId);
      }
    }

    // Cull removed after a beat
    this.friendlies = this.friendlies.filter((drone) => drone.status !== "removed");
    this.enemies = this.enemies.filter((enemy) => enemy.status !== "removed");

    // Occasionally spawn a new enemy contact
    if (Math.random() < 0.05 && this.enemies.length < 14) {
      this.enemies.push(makeEnemyDrone(Math.floor(Math.random() * 1000)));
    }

    this.emitFriendlyDrones();
    this.emitEnemyDrones();
  }
}

export const gcsSocket = new GcsSocket();
