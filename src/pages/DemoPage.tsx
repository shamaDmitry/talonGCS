import { Demo } from "@/components/Demo";
import { ModeToggle } from "@/components/mode-toggle";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const DemoPage = () => {
  return (
    <div className="bg-muted">
      <ModeToggle />

      <div className="container mx-auto p-4 h-120">
        <MapContainer
          className="h-full"
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <Demo />
    </div>
  );
};

export default DemoPage;
