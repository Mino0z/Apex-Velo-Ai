import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix dla ikon (ważne w React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 📍 Komponent do obsługi kliknięć na mapie
function MapClickHandler({ setStart, setEnd, start, end }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (!start) {
        setStart({ lat, lon: lng });
      } else if (!end) {
        setEnd({ lat, lon: lng });
      } else {
        // reset jeśli oba już istnieją
        setStart({ lat, lon: lng });
        setEnd(null);
      }
    },
  });

  return null;
}

export default function App() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [route, setRoute] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8000"; // zmień na Railway jeśli deploy

  const generateRoute = async () => {
    if (!start || !end) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/suggest-corridor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_lat: start.lat,
          start_lon: start.lon,
          end_lat: end.lat,
          end_lon: end.lon,
        }),
      });

      const data = await res.json();

      if (data.geometry) {
        setRoute(data.geometry.coordinates); // [lat, lon]
      }

      if (data.statistics) {
        setStats(data.statistics);
      }
    } catch (err) {
      console.error("Błąd:", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* 🗺️ MAPA */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[50.0647, 19.9450]} // Kraków
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            setStart={setStart}
            setEnd={setEnd}
            start={start}
            end={end}
          />

          {/* Markery */}
          {start && <Marker position={[start.lat, start.lon]} />}
          {end && <Marker position={[end.lat, end.lon]} />}

          {/* Trasa */}
          {route.length > 0 && (
            <Polyline positions={route} />
          )}
        </MapContainer>
      </div>

      {/* 📊 PANEL BOCZNY */}
      <div
        style={{
          width: "350px",
          padding: "20px",
          background: "#1e1e1e",
          color: "white",
          overflowY: "auto",
        }}
      >
        <h2>Nawigacja</h2>

        <p>Kliknij na mapie:</p>
        <ul>
          <li>1 klik → punkt startowy</li>
          <li>2 klik → punkt końcowy</li>
          <li>3 klik → reset</li>
        </ul>

        <hr />

        <h3>Start:</h3>
        {start ? (
          <p>
            {start.lat.toFixed(5)}, {start.lon.toFixed(5)}
          </p>
        ) : (
          <p>Nie wybrano</p>
        )}

        <h3>Koniec:</h3>
        {end ? (
          <p>
            {end.lat.toFixed(5)}, {end.lon.toFixed(5)}
          </p>
        ) : (
          <p>Nie wybrano</p>
        )}

        <button
          onClick={generateRoute}
          disabled={!start || !end || loading}
          style={{
            marginTop: "20px",
            padding: "10px",
            width: "100%",
            background: "#4CAF50",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Generowanie..." : "Generuj trasę"}
        </button>

        <hr />

        {/* 📈 STATYSTYKI */}
        <h3>Statystyki:</h3>
        {stats ? (
          <div>
            {Object.entries(stats).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
          </div>
        ) : (
          <p>Brak danych</p>
        )}
      </div>
    </div>
  );
}
