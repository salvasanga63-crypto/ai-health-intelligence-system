import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

export default function DeviceTelemetry() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [status, setStatus] = useState('Loading devices...');

  useEffect(() => {
    async function loadDevices() {
      const response = await authFetch('/devices');
      if (response.status === 401) {
        setStatus('Login required to view devices.');
        return;
      }
      const data = await response.json();
      setDevices(data);
      setStatus(data.length ? '' : 'No devices registered yet.');
    }

    loadDevices();
  }, []);

  async function loadTelemetry(deviceId) {
    setSelectedDevice(deviceId);
    setStatus('Loading telemetry...');
    const response = await authFetch(`/devices/${deviceId}/data`);
    if (response.status === 401) {
      setStatus('Login required to view telemetry.');
      return;
    }
    const data = await response.json();
    setTelemetry(data);
    setStatus(data.length ? '' : 'No telemetry found for this device.');
  }

  return (
    <Layout title="Device Telemetry">
      <h1>Device Telemetry</h1>
      <p>Choose a device to inspect recent telemetry and status history.</p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {Array.isArray(devices) && devices.map((device) => (
          <button
            key={device.device_id}
            type="button"
            onClick={() => loadTelemetry(device.device_id)}
            style={{ padding: '12px 18px', borderRadius: '12px', cursor: 'pointer' }}
          >
            {device.name}
          </button>
        ))}
      </div>

      {selectedDevice && <h2>Telemetry for device #{selectedDevice}</h2>}
      <p>{status}</p>
      <ul>
        {telemetry.map((record) => (
          <li key={record.data_id}>
            <strong>{new Date(record.timestamp).toLocaleString()}</strong> — Temp {record.temperature}°C — Vibration {record.vibration} — Usage {record.usage_hours} hrs
            <div>{record.status_report}</div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
