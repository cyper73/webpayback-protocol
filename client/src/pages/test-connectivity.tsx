import { useEffect, useState } from 'react';

export default function TestConnectivity() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/analytics/dashboard?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        console.log('✅ Connection Test SUCCESS:', result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('❌ Connection Test FAILED:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '20px',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <h1>🔧 CONNECTIVITY TEST</h1>
      
      {error && (
        <div style={{ backgroundColor: 'darkred', padding: '10px', margin: '10px 0' }}>
          <h2>❌ ERROR:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {data && (
        <div style={{ backgroundColor: 'darkgreen', padding: '10px', margin: '10px 0' }}>
          <h2>✅ SUCCESS - Data Received:</h2>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>🔍 Debug Info:</h3>
        <p>Timestamp: {new Date().toISOString()}</p>
        <p>Location: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
    </div>
  );
}