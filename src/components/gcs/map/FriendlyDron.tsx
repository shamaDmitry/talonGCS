import { cn } from "@/lib/utils";
import type { FriendlyDrone } from "@/types/drone";
import L from "leaflet";

const FriendlyDron = (drone: FriendlyDrone, selected: boolean) => {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
        <div class="relative w-7 h-7 ">
          <div class="${cn(
            "absolute inset-0 flex items-center justify-center",
            {
              "scale-125": selected,
            },
          )}" style="transform: rotate(${drone.azimuth}deg)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${cn(
              "text-success",
              {
                "text-info": selected,
              },
            )}">
              <path d="M12 2 L4 22 L12 17 L20 22 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      `,
  });
};

export default FriendlyDron;
