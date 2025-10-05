'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const initializeBot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bot', { method: 'POST' });
      const data = await response.json();
      console.log('Bot initialized:', data);
    } catch (error) {
      console.error('Error initializing bot:', error);
    }
    setLoading(false);
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/bot');
      const data = await response.json();
      setQrCode(data.qrCode);
      setConnected(data.connected);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  useEffect(() => {
    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Voice Bridge WhatsApp Bot</h1>
        
        <div className="text-center">
          {loading ? (
            <div className="text-blue-600">Initializing bot...</div>
          ) : connected ? (
            <div className="text-green-600 font-semibold">
              ✅ WhatsApp Bot Connected!
            </div>
          ) : qrCode ? (
            <div>
              <p className="text-gray-600 mb-4">Scan this QR code with WhatsApp:</p>
              <div className="bg-white p-4 rounded border inline-block">
                <pre className="text-xs font-mono whitespace-pre-wrap">{qrCode}</pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Click to start WhatsApp bot</p>
              <button
                onClick={initializeBot}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Start Bot
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>This bot will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Convert voice messages to text</li>
            <li>Process with AI</li>
            <li>Convert response back to voice</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
