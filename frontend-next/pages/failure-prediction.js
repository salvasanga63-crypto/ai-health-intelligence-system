import { useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

export default function FailurePrediction() {
  const [temperature, setTemperature] = useState(72);
  const [vibration, setVibration] = useState(0.2);
  const [usageHours, setUsageHours] = useState(1200);
  const [ageMonths, setAgeMonths] = useState(24);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Predicting failure risk...');
    const response = await authFetch('/equipment/failure-prediction', {
      method: 'POST',
      body: JSON.stringify({
        temperature: Number(temperature),
        vibration: Number(vibration),
        usage_hours: Number(usageHours),
        age_months: Number(ageMonths),
      }),
    });

    if (response.status === 401) {
      setStatus('Login required to predict maintenance risk.');
      return;
    }

    const data = await response.json();
    setResult(data);
    setStatus('');
  };

  return (
    <Layout title="Failure Prediction">
      <h1>Equipment Failure Prediction</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Temperature (°C)
          <input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        </label>
        <label>
          Vibration (mm/s)
          <input type="number" step="0.01" value={vibration} onChange={(e) => setVibration(e.target.value)} />
        </label>
        <label>
          Usage Hours
          <input type="number" value={usageHours} onChange={(e) => setUsageHours(e.target.value)} />
        </label>
        <label>
          Equipment Age (months)
          <input type="number" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} />
        </label>
        <button type="submit">Predict Maintenance Risk</button>
      </form>
      <p>{status}</p>
      {result && (
        <div>
          <h2>Prediction Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Layout>
  );
}
