'use client';

import { useEffect, useState } from 'react';

export function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Verificando conexión a la base de datos...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (response.ok) {
          setStatus('connected');
          setMessage(`✅ ${data.message}`);
          console.log('Base de datos conectada:', data.timestamp);
        } else {
          setStatus('error');
          setMessage(`❌ ${data.message}: ${data.error}`);
          console.error('Error de conexión:', data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('❌ No se pudo conectar con el servidor');
        console.error('Error:', error);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 p-3 rounded-md text-sm font-medium">
      {status === 'checking' && (
        <div className="bg-blue-100 text-blue-800 border border-blue-300">{message}</div>
      )}
      {status === 'connected' && (
        <div className="bg-green-100 text-green-800 border border-green-300">{message}</div>
      )}
      {status === 'error' && (
        <div className="bg-red-100 text-red-800 border border-red-300">{message}</div>
      )}
    </div>
  );
}
