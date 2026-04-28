// import { useEffect, useMemo, useState } from "react";
import { Menu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { GcsSidebar } from "@/components/gcs/GcsSidebar";
import { useDroneFeed } from "@/hooks/useDroneFeed";
// import { toast } from "sonner";
// import { GcsSidebar } from "@/components/gcs/GcsSidebar";
// import { TacticalMap } from "@/components/gcs/TacticalMap";
// import { DroneDetails } from "@/components/gcs/DroneDetails";
// import { useDroneFeed } from "@/hooks/useDroneFeed";

const Index = () => {
  const { friendlies, enemies } = useDroneFeed();

  const [selectedFriendlyId, setSelectedFriendlyId] = useState<string | null>(
    null,
  );

  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-select first drone
  // useEffect(() => {
  //   if (!selectedFriendlyId && friendlies.length > 0) {
  //     setSelectedFriendlyId(friendlies[0].id);
  //   }
  // }, [friendlies, selectedFriendlyId]);

  // Drop selection if drone removed
  // useEffect(() => {
  //   if (
  //     selectedFriendlyId &&
  //     !friendlies.find((d) => d.id === selectedFriendlyId)
  //   ) {
  //     setSelectedFriendlyId(friendlies[0]?.id ?? null);
  //   }
  // }, [friendlies, selectedFriendlyId]);

  useEffect(() => {
    if (selectedEnemyId && !enemies.find((e) => e.id === selectedEnemyId)) {
      const timerId = setTimeout(() => {
        setSelectedEnemyId(null);
      }, 0);

      return () => clearTimeout(timerId);
    }
  }, [enemies, selectedEnemyId]);

  // const selectedFriendly = useMemo(
  //   () => friendlies.find((d) => d.id === selectedFriendlyId) ?? null,
  //   [friendlies, selectedFriendlyId],
  // );
  // const selectedEnemy = useMemo(
  //   () => enemies.find((e) => e.id === selectedEnemyId) ?? null,
  //   [enemies, selectedEnemyId],
  // );

  // function handleAttack() {
  //   if (!selectedFriendly || !selectedEnemy) return;
  //   attack(selectedFriendly.id, selectedEnemy.id);
  //   toast.success(`${selectedFriendly.callsign} engaging ${selectedEnemy.id}`, {
  //     description: "Strike vector locked. Tracking target.",
  //   });
  // }

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      <GcsSidebar
        drones={friendlies}
        selectedId={selectedFriendlyId}
        onSelect={(id) => {
          setSelectedFriendlyId(id);
          setMobileOpen(false);
        }}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface/60 backdrop-blur flex items-center px-3 gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />

            <h1 className="font-mono text-sm font-semibold tracking-widest">
              MISSION · OVERWATCH
            </h1>
          </div>

          <div className="ml-auto hidden sm:flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span>
              FR{" "}
              <span className="text-success">
                11 {/* {friendlies.length} */}
              </span>
            </span>

            <span>
              HST{" "}
              <span className="text-hostile">
                22
                {/* {enemies.length} */}
              </span>
            </span>

            <span className="hidden md:inline">SECTOR · 50.45N 30.52E</span>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] min-h-0">
          <div className="relative min-h-[40vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border">
            Map
            {/* <TacticalMap
              friendlies={friendlies}
              enemies={enemies}
              selectedFriendlyId={selectedFriendlyId}
              selectedEnemyId={selectedEnemyId}
              onSelectFriendly={setSelectedFriendlyId}
              onSelectEnemy={setSelectedEnemyId}
            /> */}
          </div>

          <aside className="bg-surface/30 min-h-0 overflow-hidden">
            DroneDetails
            {/* <DroneDetails
              drone={selectedFriendly}
              enemy={selectedEnemy}
              onAttack={handleAttack}
            /> */}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Index;
