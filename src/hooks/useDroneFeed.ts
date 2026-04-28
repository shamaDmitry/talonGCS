import { useEffect, useState } from "react";
import type { EnemyDrone, FriendlyDrone } from "@/types/drone";
import { gcsSocket } from "@/services/socket";

export function useDroneFeed() {
  const [friendlies, setFriendlies] = useState<FriendlyDrone[]>([]);
  const [enemies, setEnemies] = useState<EnemyDrone[]>([]);

  useEffect(() => {
    gcsSocket.connect();

    const offF = gcsSocket.onFriendly(setFriendlies);
    const offE = gcsSocket.onEnemy(setEnemies);

    return () => {
      offF();
      offE();
    };
  }, []);

  return { friendlies, enemies, attack: gcsSocket.attack.bind(gcsSocket) };
}
