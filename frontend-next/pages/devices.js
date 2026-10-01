import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState('Loading devices...');

  async function loadDevices() {
    const response = await authFetch('/devices');
    if (response.status === 401) {
      setStatus('Login required to view devices.');
      return;
    }
    const data = await response.json();
    setDevices(data);
    setStatus('');
  }

  async function registerDevice() {
    setStatus('Registering device...');
    const response = await authFetch('/devices', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Vital Signs Monitor Z',
        device_type: 'Vitals Monitor',
        location: 'Ward 3B',
        status: 'online',
      }),
    });

    if (response.status === 401) {
      setStatus('Login required to register devices.');
      return;
    }

    const device = await response.json();
    setDevices((prev) => [device, ...(Array.isArray(prev) ? prev : [])]);
    setStatus(`Registered device: ${device.name}`);
  }

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <Layout title="Device Management">
      <h1>Device Management</h1>
      <button type="button" onClick={registerDevice}>Register New Device</button>
      <p>{status}</p>
      <ul>
        {Array.isArray(devices) && devices.map((device) => (
          <li key={device.device_id}>
            <strong>{device.name}</strong> — {device.device_type} — {device.location} — {device.status}
          </li>
        ))}
      </ul>
    </Layout>
  );
}
