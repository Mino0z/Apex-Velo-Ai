import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// 🔥 HEATMAP COMPONENT
function Heatmap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.1: "blue",
        0.3: "lime",
        0.6: "orange",
        1.0: "red",
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

// 🔥 AUTO ZOOM DO TRASY
function FitBounds({ route }) {
  const map = useMap();

  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);

  return null;
}

// Fix ikon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 📍 Klikanie mapy
function MapClickHandler({ setStart, setEnd, start, end }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (!start) {
        setStart({ lat, lon: lng });
      } else if (!end) {
        setEnd({ lat, lon: lng });
      } else {
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

  const [mode, setMode] = useState("green");
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const API_URL = "http://localhost:8000";

  // 🔥 HEATMAP FETCH
  const fetchHeatmap = async () => {
    try {
      const res = await fetch(`${API_URL}/heatmap/green`);
      const data = await res.json();
      setHeatmapData(data.points || []);
    } catch (err) {
      console.error("Heatmap error:", err);
    }
  };

  useEffect(() => {
    if (showHeatmap) {
      fetchHeatmap();
    }
  }, [showHeatmap]);

  // 🚴 ROUTE
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
          mode: mode,
        }),
      });

      const data = await res.json();

      if (data.geometry) {
        setRoute(data.geometry.coordinates);
      }

      if (data.statistics) {
        setStats(data.statistics);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 🗺️ MAPA */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[50.0647, 19.9450]}
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

          {start && <Marker position={[start.lat, start.lon]} />}
          {end && <Marker position={[end.lat, end.lon]} />}

          {route.length > 0 && <Polyline positions={route} />}

          <FitBounds route={route} />

          {/* 🔥 HEATMAP */}
          {showHeatmap && heatmapData.length > 0 && (
            <Heatmap points={heatmapData} />
          )}
        </MapContainer>
      </div>

      {/* 📊 PANEL */}
      <div
        style={{
          width: "350px",
          background: "#1e1e1e",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Nawigacja</h2>

        <p>Kliknij na mapie:</p>
        <ul>
          <li>Start → pierwszy klik</li>
          <li>Koniec → drugi klik</li>
        </ul>

        <hr />

        <h3>Tryb trasy:</h3>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="green">🌳 Green</option>
          <option value="safe">🛡 Safe</option>
          <option value="fast">⚡ Fast</option>
        </select>

        <hr />

        <h3>Heatmapa:</h3>
        <label>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={() => setShowHeatmap(!showHeatmap)}
          />
          Pokaż green heatmap
        </label>

        <hr />

        <h3>Start:</h3>
        {start ? (
          <p>{start.lat.toFixed(5)}, {start.lon.toFixed(5)}</p>
        ) : (
          <p>Brak</p>
        )}

        <h3>Koniec:</h3>
        {end ? (
          <p>{end.lat.toFixed(5)}, {end.lon.toFixed(5)}</p>
        ) : (
          <p>Brak</p>
        )}

        <button
          onClick={generateRoute}
          disabled={!start || !end || loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            background: "#4CAF50",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Liczenie..." : "Generuj trasę"}
        </button>

        <hr />

        <h3>Statystyki:</h3>
        {stats ? (
          Object.entries(stats).map(([k, v]) => (
            <p key={k}>
              <strong>{k}:</strong> {v}
            </p>
          ))
        ) : (
          <p>Brak danych</p>
        )}
      </div>
    </div>
  );
}
