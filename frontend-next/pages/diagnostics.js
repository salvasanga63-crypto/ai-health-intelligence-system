import { useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

export default function Diagnostics() {
  const [result, setResult] = useState(null);
  const [symptoms, setSymptoms] = useState('fever,cough,chest pain');
  const [history, setHistory] = useState('smoking,asthma');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('symptoms', symptoms);
      formData.append('history', history);
      if (imageFile) {
        formData.append('file', imageFile);
      }
      
      const response = await authFetch('/diagnose', { method: 'POST', body: formData });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Diagnostics with Image Analysis">
      <h1>AI Diagnostics</h1>
      <p>Analyze patient symptoms, medical history, and optionally upload medical images for AI analysis.</p>
      
      <form onSubmit={handleSubmit} className="form" style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Symptoms (comma-separated)
            <textarea 
              value={symptoms} 
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ width: '100%', minHeight: 60, padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Medical History (comma-separated)
            <textarea 
              value={history} 
              onChange={(e) => setHistory(e.target.value)}
              style={{ width: '100%', minHeight: 60, padding: 8 }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Medical Image (optional - X-ray, CT scan, ultrasound, etc.)
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', marginTop: 8 }}
            />
            {imageFile && <p style={{ fontSize: 12, color: '#666' }}>File: {imageFile.name}</p>}
          </label>
        </div>

        {imagePreview && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 'bold' }}>Image Preview:</p>
            <img 
              src={imagePreview} 
              alt="Medical image preview" 
              style={{ maxWidth: '100%', maxHeight: 200, border: '1px solid #ccc', borderRadius: 4 }}
            />
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 30, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <h2>AI Diagnosis Result</h2>
          {result.error ? (
            <div style={{ color: 'red' }}>Error: {result.error}</div>
          ) : (
            <>
              <p><strong>Condition:</strong> {result.condition}</p>
              <p><strong>Confidence:</strong> {result.confidence}%</p>
              <p><strong>Recommendation:</strong> {result.recommendation}</p>
              {result.image_analysis && (
                <div style={{ marginTop: 12 }}>
                  <p><strong>Image Analysis:</strong> {result.image_analysis}</p>
                </div>
              )}
              <details style={{ marginTop: 16 }}>
                <summary>Full JSON Response</summary>
                <pre style={{ background: '#fff', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
