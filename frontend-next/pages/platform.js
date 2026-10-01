import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function PlatformHealth() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/platform/health`)
      .then((res) => res.json())
      .then(setHealth);
  }, []);

  return (
    <Layout title="Platform Health">
      <h1>Platform Health</h1>
      {health ? <pre>{JSON.stringify(health, null, 2)}</pre> : <p>Checking health...</p>}
    </Layout>
  );
}
