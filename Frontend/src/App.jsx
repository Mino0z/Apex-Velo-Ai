import React, { useState } from 'react';
import axios from 'axios';
import { Bike, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

function App() {
  const [message, setMessage] = useState('Oczekiwanie na połączenie...');
  const [loading, setLoading] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      // Tu używamy Axiosa do zapytania Twojego Pythona
      const response = await axios.get('http://127.0.0.1:8000/api/test');
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Błąd połączenia! Czy na pewno odpaliłeś main.py?');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <header>
        <h1 style={{ color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Bike size={48} /> SafeTransit Kraków
        </h1>
        <p>Inteligentna optymalizacja tras rowerowych</p>
      </header>

      <div style={{ marginTop: '50px', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', background: '#f9f9f9' }}>
        <h3>Status Systemu:</h3>
        <p style={{ fontWeight: 'bold', color: message.includes('Błąd') ? 'red' : '#333' }}>
          {loading ? 'Łączenie...' : message}
        </p>
        
        <button 
          onClick={checkConnection}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '20px auto'
          }}
        >
          <Zap size={20} /> Sprawdź "Mózg" (Python)
        </button>
      </div>

      <footer style={{ marginTop: '40px', color: '#666', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={16} /> Bezpieczeństwo</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><AlertCircle size={16} /> Dane z MSIP</span>
        </div>
      </footer>
    </div>
  );
}

export default App;