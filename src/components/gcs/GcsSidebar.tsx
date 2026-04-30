import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Radar, Search, X } from "lucide-react";
import type { FriendlyDrone } from "@/types/drone";
import { DroneListItem } from "@/components/gcs/DroneListItem";

interface GcsSidebarProps {
  drones: FriendlyDrone[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function GcsSidebar({
  drones,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: GcsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDrones = drones.filter((drone) => {
    return (
      drone.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const activeDronesCount = drones.filter((drone) => {
    return drone.status === "active" || drone.status === "engaging";
  }).length;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-4000 bg-background/70 backdrop-blur-sm md:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "z-5000 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          // mobile
          "fixed inset-y-0 left-0 w-72 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // desktop width
          "md:flex",
          collapsed ? "md:w-14" : "md:w-72",
        )}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-sm bg-linear-to-tl from-primary to-secondary grid place-items-center">
                <Radar className="w-4 h-4 text-primary-foreground" />
              </div>

              <div>
                <div className="font-mono text-xs font-bold tracking-widest">
                  TALON·GCS
                </div>

                <div className="hud-label text-xs">FLEET CONTROL</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-full grid place-items-center">
              <Radar className="w-5 h-5 text-primary" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onCloseMobile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!collapsed && (
          <div className="px-3 py-3 grid grid-cols-2 gap-2 border-b border-sidebar-border">
            <div className="panel px-2.5 py-2">
              <div className="hud-label">Fleet</div>

              <div className="hud-value text-lg leading-none mt-1">
                {drones.length}
              </div>
            </div>

            <div className="panel px-2.5 py-2">
              <div className="hud-label">Active</div>

              <div className="hud-value text-lg leading-none mt-1 text-success">
                {activeDronesCount}
              </div>
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search callsign…"
                className="h-8 pl-8 bg-surface border-border font-mono text-xs"
              />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 h-1">
          <div
            className={cn("p-2 space-y-2", {
              "px-1": collapsed,
            })}
          >
            {filteredDrones.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                No drones found.
              </div>
            )}

            {collapsed
              ? drones.map((drone) => {
                  return (
                    <Button
                      key={drone.id}
                      onClick={() => onSelect(drone.id)}
                      title={drone.callsign}
                      className={cn(
                        "w-full h-10 rounded-md grid place-items-center font-mono text-base transition-colors",
                        {
                          "bg-primary text-primary-foreground":
                            selectedId === drone.id,
                          "bg-sidebar-accent/40 text-foreground hover:bg-sidebar-accent":
                            selectedId !== drone.id,
                        },
                      )}
                    >
                      {drone.id.split("-")[1]}
                    </Button>
                  );
                })
              : filteredDrones.map((drone) => {
                  return (
                    <DroneListItem
                      key={drone.id}
                      drone={drone}
                      selected={selectedId === drone.id}
                      onClick={() => onSelect(drone.id)}
                    />
                  );
                })}
          </div>
        </ScrollArea>

        <div className="hidden md:flex border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="lg"
            onClick={onToggleCollapsed}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-1 text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
