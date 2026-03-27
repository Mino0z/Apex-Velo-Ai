import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  // Współrzędne centrum Krakowa (Rynek Główny)
  const centerKrakow = [50.0614, 19.9365];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h2 style={{ textAlign: 'center', position: 'absolute', zIndex: 1000, width: '100%', background: 'rgba(255,255,255,0.8)' }}>
        SafeTransit: Mapa Krakowa
      </h2>
      
      <MapContainer center={centerKrakow} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={centerKrakow}>
          <Popup>Tu zaczynamy naszą bezpieczną trasę!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;