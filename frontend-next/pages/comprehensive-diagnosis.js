import { useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

export default function ComprehensiveDiagnosis() {
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('fever,cough');
  const [history, setHistory] = useState('asthma');
  const [bmi, setBmi] = useState(28);
  const [calories, setCalories] = useState(2600);
  const [waterIntake, setWaterIntake] = useState(1.8);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!patientId) {
      setStatus('Patient ID is required.');
      return;
    }
    setStatus('Submitting patient diagnosis...');
    const response = await authFetch(`/patients/${encodeURIComponent(patientId)}/comprehensive-diagnosis`, {
      method: 'POST',
      body: JSON.stringify({
        symptoms,
        history,
        nutrition_data: {
          bmi: Number(bmi),
          daily_calories: Number(calories),
          water_intake: Number(waterIntake),
        },
      }),
    });

    if (response.status === 401) {
      setStatus('Login required to run patient diagnosis.');
      return;
    }

    const data = await response.json();
    setResult(data);
    setStatus('');
  };

  return (
    <Layout title="Comprehensive Diagnosis">
      <h1>Patient-specific AI Diagnosis</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Patient ID
          <input value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        </label>
        <label>
          Symptoms
          <input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
        </label>
        <label>
          History
          <input value={history} onChange={(e) => setHistory(e.target.value)} />
        </label>
        <label>
          BMI
          <input type="number" value={bmi} onChange={(e) => setBmi(e.target.value)} />
        </label>
        <label>
          Daily Calories
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </label>
        <label>
          Water Intake (L)
          <input type="number" step="0.1" value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)} />
        </label>
        <button type="submit">Run Diagnosis</button>
      </form>
      <p>{status}</p>
      {result && (
        <div>
          <h2>Diagnosis Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Layout>
  );
}
