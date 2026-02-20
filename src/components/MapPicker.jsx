import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapPicker({ location, setLocation }) {
  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border mt-3">
      <MapContainer
        center={[8.9806, 38.7578]} // Ethiopia default
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker setLocation={setLocation} />

        {location.lat && location.lng && (
          <Marker
            position={[location.lat, location.lng]}
            icon={markerIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}
