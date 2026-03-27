import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Bike, Wind, Shield, Zap, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const mockRoute = [
  [50.0647, 19.9450], [50.0614, 19.9365], [50.0580, 19.9340], [50.0520, 19.9400]
];

const initialNoiseData = [
  { time: '0%', db: 45 }, { time: '25%', db: 65 }, { time: '50%', db: 50 },
  { time: '75%', db: 70 }, { time: '100%', db: 40 }
];

function App() {
  const [safetyWeight, setSafetyWeight] = useState(50);
  const [ecoWeight, setEcoWeight] = useState(50);
  const [currentRoute, setCurrentRoute] = useState(mockRoute);
  const [noiseData, setNoiseData] = useState(initialNoiseData);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("System gotowy");

  const generateRoute = async () => {
    setLoading(true);
    setBackendStatus("Łączenie z silnikiem analizy...");
    
    // 1. "PSUCIE" TRASY (Dla efektu wizualnego)
    const wiggledRoute = currentRoute.map(p => [
      p[0] + (Math.random() - 0.5) * 0.002, 
      p[1] + (Math.random() - 0.5) * 0.002
    ]);
    setCurrentRoute(wiggledRoute);

    // 2. Symulacja zmiany wykresu
    const randomData = noiseData.map(d => ({
      ...d,
      db: Math.floor(Math.random() * 40) + 35 
    }));
    setNoiseData(randomData);

    // 3. Wysłanie danych do Pythona
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/test', {
        params: {
          safety: safetyWeight,
          eco: ecoWeight
        }
      });
      // Tu odbieramy wiadomość z Twojego nowego main.py!
      setBackendStatus(response.data.message);
      console.log("Dane z backendu:", response.data);
    } catch (error) {
      setBackendStatus("Błąd: Backend nie odpowiada.");
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '350px', background: '#1e293b', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '4px 0 15px rgba(0,0,0,0.3)', zIndex: 1001 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bike size={32} color="#22c55e" />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>SafeTransit</h2>
        </div>

        {/* STATUS Z BACKENDU */}
        <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="#22c55e" />
          <span>{backendStatus}</span>
        </div>

        <div style={{ background: '#334155', padding: '15px', borderRadius: '10px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#94a3b8' }}>PREFERENCJE TRASY</p>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Shield size={14}/> Bezpieczeństwo</span>
              <span>{safetyWeight}%</span>
            </label>
            <input 
              type="range" 
              style={{ width: '100%', accentColor: '#22c55e' }} 
              value={safetyWeight} 
              onChange={(e) => setSafetyWeight(Number(e.target.value))}
            />
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Wind size={14}/> Ekologia (Zieleń)</span>
              <span>{ecoWeight}%</span>
            </label>
            <input 
              type="range" 
              style={{ width: '100%', accentColor: '#22c55e' }} 
              value={ecoWeight} 
              onChange={(e) => setEcoWeight(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ flexGrow: 1, background: '#334155', padding: '15px', borderRadius: '10px', minHeight: '200px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#94a3b8' }}>ESTYMOWANY HAŁAS [dB]</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={noiseData}>
              <Line type="monotone" dataKey="db" stroke="#22c55e" strokeWidth={2} dot={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff', fontSize: '12px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button 
          onClick={generateRoute} 
          disabled={loading}
          style={{ 
            background: loading ? '#475569' : '#22c55e', 
            color: 'white', border: 'none', padding: '12px', borderRadius: '8px', 
            fontWeight: 'bold', cursor: 'pointer', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', gap: '10px' 
          }}
        >
          <Zap size={18} /> {loading ? 'GENEROWANIE...' : 'GENERUJ TRASĘ'}
        </button>
      </div>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer center={[50.0614, 19.9365]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <Polyline positions={currentRoute} color="#22c55e" weight={5} opacity={0.7} dashArray="10, 10" />
          <Marker position={[50.0647, 19.9450]}><Popup>Start</Popup></Marker>
          <Marker position={[50.0520, 19.9400]}><Popup>Koniec</Popup></Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;