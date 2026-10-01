import { useState } from 'react';
import Layout from '../components/Layout';
import { authFetch, API_BASE } from '../lib/api';

export default function DiagnoseFormData() {
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [nutritionData, setNutritionData] = useState('{}');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Create FormData similar to: curl -F "symptoms=..." -F "history=..." -F "file=@..." POST /api/diagnose
      const formData = new FormData();
      formData.append('patient_id', patientIdentifier);
      formData.append('symptoms', symptoms);
      formData.append('history', history);
      formData.append('nutrition_data', nutritionData);
      if (file) {
        formData.append('file', file);
      }

      const response = await authFetch('/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Diagnosis failed');
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Clinical Intake">
      <div className="intake-page">
        <h1>Clinical Intake</h1>
        <p>Submit patient symptoms, medical history, nutrition context, and optional files for detailed AI analysis and record keeping.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '20px auto' }}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Patient Name / ID:
            <input value={patientIdentifier} onChange={(e) => setPatientIdentifier(e.target.value)} placeholder="Enter patient name or ID" />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Symptoms (comma-separated):
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., fever, cough, fatigue"
              style={{ width: '100%', minHeight: 80, padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Medical History:
            <textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="e.g., diabetes, hypertension"
              style={{ width: '100%', minHeight: 80, padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Nutrition Data (JSON):
            <textarea
              value={nutritionData}
              onChange={(e) => setNutritionData(e.target.value)}
              placeholder='{"diet_type": "balanced"}'
              style={{ width: '100%', minHeight: 60, padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Upload Medical File (optional):
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: 8 }}
            />
            {file && <p>File selected: {file.name}</p>}
          </label>
          <button type="submit" disabled={loading} style={{ marginTop: 12, width: '100%' }}>
            {loading ? 'Analyzing...' : 'Get AI Diagnosis'}
          </button>
        </div>

        <p className="intake-submit-note">Patient data and the optional file are submitted together for analysis.</p>
      </form>

      {error && (
        <div style={{ color: 'red', margin: '20px', padding: 10, background: '#ffe6e6', borderRadius: 4 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ margin: '20px', padding: 16, background: '#e6f7ff', borderRadius: 4 }}>
          <h2>AI Diagnosis Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>

          <div style={{ marginTop: 16 }}>
            <h3>Parsed Output:</h3>
            <div style={{ background: '#fff', padding: 12, borderRadius: 4, border: '1px solid #ddd' }}>
              <p><strong>Condition:</strong> {result.condition}</p>
              <p><strong>Confidence:</strong> {result.confidence}%</p>
              <p><strong>Recommendation:</strong> {result.recommendation}</p>
              {result.nutrition_note && <p><strong>Nutrition Note:</strong> {result.nutrition_note}</p>}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h3>AI Diagnostics</h3>
        <pre style={{ background: '#fff', padding: 10, overflow: 'auto' }}>
{`curl -X POST ${API_BASE}/diagnose \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "symptoms=${symptoms || 'fever,cough'}" \\
  -F "history=${history || 'diabetes'}" \\
  -F "nutrition_data=${nutritionData}" \\
  ${file ? `-F "file=@${file.name}" \\` : ''}`}
        </pre>
        </div>
      </div>
    </Layout>
  );
}
