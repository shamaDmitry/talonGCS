import { useEffect, useState } from "react";
import type { EnemyDrone, FriendlyDrone } from "@/types/drone";
import { gcsSocket } from "@/services/socket";

export function useDroneFeed() {
  const [friendlies, setFriendlies] = useState<FriendlyDrone[]>([]);
  const [enemies, setEnemies] = useState<EnemyDrone[]>([]);

  useEffect(() => {
    gcsSocket.connect();

    const unsubscribeFriendlies = gcsSocket.onFriendly(setFriendlies);
    const unsubscribeEnemies = gcsSocket.onEnemy(setEnemies);

    return () => {
      unsubscribeFriendlies();
      unsubscribeEnemies();
    };
  }, []);

  return { friendlies, enemies, attack: gcsSocket.attack.bind(gcsSocket) };
}
