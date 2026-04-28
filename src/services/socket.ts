/**
 * Socket service stub.
 * Mocks a real-time WS feed for friendly drones + enemy contacts.
 * Swap `connect()` for a real WebSocket later — public API stays the same.
 */
import type { EnemyDrone, FriendlyDrone } from "@/types/drone";

type Listener<T> = (data: T) => void;

const BASE: [number, number] = [50.4501, 30.5234]; // Kyiv center

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

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function jitter(base: number, amt: number) {
  return base + (Math.random() - 0.5) * amt;
}

function makeFriendly(i: number): FriendlyDrone {
  return {
    id: `FR-${String(i + 1).padStart(2, "0")}`,
    callsign: `${CALLSIGNS[i % CALLSIGNS.length]}-${i + 1}`,
    status: i % 7 === 0 ? "idle" : "active",
    lat: jitter(BASE[0], 0.06),
    lng: jitter(BASE[1], 0.08),
    alt: rand(80, 320),
    speed: rand(8, 28),
    battery: rand(35, 100),
    flightTime: Math.floor(rand(60, 1800)),
    azimuth: rand(0, 360),
    signal: rand(60, 100),
    payload: PAYLOADS[i % PAYLOADS.length],
    targetId: null,
  };
}

function makeEnemy(i: number): EnemyDrone {
  return {
    id: `TRK-${i + 1}`,
    lat: jitter(BASE[0], 0.08),
    lng: jitter(BASE[1], 0.1),
    direction: rand(0, 360),
    status: "active",
  };
}

class GcsSocket {
  private friendlies: FriendlyDrone[] = Array.from({ length: 12 }, (_, i) =>
    makeFriendly(i),
  );
  private enemies: EnemyDrone[] = Array.from({ length: 8 }, (_, i) =>
    makeEnemy(i),
  );
  private friendlyListeners = new Set<Listener<FriendlyDrone[]>>();
  private enemyListeners = new Set<Listener<EnemyDrone[]>>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private engagements = new Map<string, { targetId: string; ttl: number }>();

  connect() {
    if (this.interval) return;

    this.interval = setInterval(() => this.tick(), 1000);

    // emit immediately
    queueMicrotask(() => {
      this.emitFriendly();
      this.emitEnemy();
    });
  }

  disconnect() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  onFriendly(cb: Listener<FriendlyDrone[]>) {
    this.friendlyListeners.add(cb);
    cb(this.snapshotFriendly());
    return () => this.friendlyListeners.delete(cb);
  }

  onEnemy(cb: Listener<EnemyDrone[]>) {
    this.enemyListeners.add(cb);
    cb(this.snapshotEnemy());
    return () => this.enemyListeners.delete(cb);
  }

  /** User-issued attack command */
  attack(friendlyId: string, enemyId: string) {
    const f = this.friendlies.find((d) => d.id === friendlyId);
    const e = this.enemies.find((d) => d.id === enemyId);
    if (!f || !e || f.status === "lost" || f.status === "removed") return;
    f.status = "engaging";
    f.targetId = enemyId;
    this.engagements.set(friendlyId, { targetId: enemyId, ttl: 6 });
    this.emitFriendly();
  }

  private snapshotFriendly() {
    return this.friendlies.map((d) => ({ ...d }));
  }
  private snapshotEnemy() {
    return this.enemies.map((d) => ({ ...d }));
  }

  private emitFriendly() {
    const snap = this.snapshotFriendly();
    this.friendlyListeners.forEach((cb) => cb(snap));
  }
  private emitEnemy() {
    const snap = this.snapshotEnemy();
    this.enemyListeners.forEach((cb) => cb(snap));
  }

  private tick() {
    // Move friendlies
    this.friendlies.forEach((d) => {
      if (d.status === "lost" || d.status === "removed") return;
      const heading = (d.azimuth * Math.PI) / 180;
      const dist = (d.speed / 111000) * 0.8;
      d.lat += Math.cos(heading) * dist;
      d.lng += Math.sin(heading) * dist;
      d.azimuth = (d.azimuth + rand(-6, 6) + 360) % 360;
      d.alt = Math.max(60, Math.min(400, d.alt + rand(-4, 4)));
      d.speed = Math.max(5, Math.min(32, d.speed + rand(-1, 1)));
      if (d.status === "active" || d.status === "engaging") {
        d.battery = Math.max(0, d.battery - rand(0.05, 0.2));
        d.flightTime += 1;
      }
      d.signal = Math.max(40, Math.min(100, d.signal + rand(-3, 3)));
    });

    // Move enemies
    this.enemies.forEach((e) => {
      if (e.status !== "active") return;
      const heading = (e.direction * Math.PI) / 180;
      const dist = 0.00012;
      e.lat += Math.cos(heading) * dist;
      e.lng += Math.sin(heading) * dist;
      e.direction = (e.direction + rand(-4, 4) + 360) % 360;
    });

    // Process engagements
    for (const [fid, eng] of this.engagements) {
      eng.ttl -= 1;
      const f = this.friendlies.find((d) => d.id === fid);
      const e = this.enemies.find((d) => d.id === eng.targetId);
      if (!f || !e) {
        this.engagements.delete(fid);
        continue;
      }
      // home toward target
      const dx = e.lng - f.lng;
      const dy = e.lat - f.lat;
      const targetAz = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
      f.azimuth = targetAz;
      f.speed = Math.min(32, f.speed + 1.5);
      const closeDist = Math.hypot(dx, dy);
      f.lat += dy * 0.18;
      f.lng += dx * 0.18;

      if (eng.ttl <= 0 || closeDist < 0.0008) {
        // BOOM
        e.status = "removed";
        f.status = "removed";
        this.engagements.delete(fid);
      }
    }

    // Cull removed after a beat
    this.friendlies = this.friendlies.filter((d) => d.status !== "removed");
    this.enemies = this.enemies.filter((d) => d.status !== "removed");

    // Occasionally spawn a new enemy contact
    if (Math.random() < 0.05 && this.enemies.length < 14) {
      this.enemies.push(makeEnemy(Math.floor(Math.random() * 1000)));
    }

    this.emitFriendly();
    this.emitEnemy();
  }
}

export const gcsSocket = new GcsSocket();
