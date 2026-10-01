import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

const clusterOptions = [
  '',
  'lactating mothers',
  'pregnant/expectant mothers',
  'children under 5',
  'children 5-17',
  'women',
  'men',
  'elders',
  'general patients',
];

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filterCluster, setFilterCluster] = useState('');
  const [status, setStatus] = useState('');

  const [loginName, setLoginName] = useState('');
  const [loginCluster, setLoginCluster] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginResult, setLoginResult] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regDateOfBirth, setRegDateOfBirth] = useState('');
  const [regContactInfo, setRegContactInfo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regClusterGroup, setRegClusterGroup] = useState('');
  const [registerResult, setRegisterResult] = useState('');

  const [loggedInPatient, setLoggedInPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [visits, setVisits] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [nutritionAssessments, setNutritionAssessments] = useState([]);
  const [pregnancyRisks, setPregnancyRisks] = useState([]);
  const [loadingMedicalData, setLoadingMedicalData] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [filterCluster]);

  async function fetchPatients() {
    const query = filterCluster ? `?cluster_group=${encodeURIComponent(filterCluster)}` : '';
    const response = await authFetch(`/patients${query}`);
    if (response.status === 401) {
      setStatus('Login required to view patients.');
      return;
    }
    const data = await response.json();
    setPatients(Array.isArray(data) ? data : []);
    setStatus('');
  }

  async function fetchMedicalData(patientId) {
    setLoadingMedicalData(true);
    try {
      const endpoints = [
        { url: `/patients/${patientId}/medical-history`, setState: setMedicalHistory },
        { url: `/patients/${patientId}/visits`, setState: setVisits },
        { url: `/patients/${patientId}/lab-results`, setState: setLabResults },
        { url: `/patients/${patientId}/prescriptions`, setState: setPrescriptions },
        { url: `/patients/${patientId}/nutrition-assessments`, setState: setNutritionAssessments },
        { url: `/patients/${patientId}/pregnancy-risks`, setState: setPregnancyRisks },
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await authFetch(endpoint.url);
          if (response.ok) {
            const data = await response.json();
            endpoint.setState(Array.isArray(data) ? data : data.items || []);
          }
        } catch (error) {
          endpoint.setState([]);
        }
      }
    } finally {
      setLoadingMedicalData(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterResult('Registering patient...');

    const response = await authFetch('/patients', {
      method: 'POST',
      body: JSON.stringify({
        first_name: regFirstName,
        last_name: regLastName,
        gender: regGender,
        date_of_birth: regDateOfBirth,
        contact_info: regContactInfo ? { phone: regContactInfo } : null,
        emergency_contact: regEmail ? { email: regEmail } : null,
        cluster_group: regClusterGroup || null,
      }),
    });

    if (response.status === 401) {
      setRegisterResult('Login required to create patients.');
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      setRegisterResult(data.error || 'Patient registration failed.');
      return;
    }

    setRegisterResult(`Patient registered: ${data.first_name} ${data.last_name}`);
    setRegFirstName('');
    setRegLastName('');
    setRegGender('');
    setRegDateOfBirth('');
    setRegContactInfo('');
    setRegEmail('');
    setRegClusterGroup('');
    fetchPatients();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginResult('Logging in...');

    const response = await authFetch('/patients/login', {
      method: 'POST',
      body: JSON.stringify({
        full_name: loginName,
        cluster_group: loginCluster,
        password: loginPassword,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setLoginResult(data.error || 'Patient login failed');
      setLoggedInPatient(null);
      return;
    }

    setLoginResult(`Logged in: ${data.patient.first_name} ${data.patient.last_name}`);
    setLoggedInPatient(data.patient);
    if (data.patient.patient_id) {
      fetchMedicalData(data.patient.patient_id);
    }
  }

  return (
    <Layout title="Patients">
      <div className="full-width-card">
        <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1>Patient Registry</h1>
            <p style={{ color: '#475569', maxWidth: 520 }}>Register new patients or log in existing patients using clearly separated cards and a centered layout.</p>
          </div>

          <div style={{ minWidth: 240 }}>
            <label>Filter patients by cluster</label>
            <select value={filterCluster} onChange={(e) => setFilterCluster(e.target.value)}>
              {clusterOptions.map((option) => (
                <option key={option} value={option}>
                  {option === '' ? 'All clusters' : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="panel-grid">
          <section className="panel-card">
            <h2>Register Patient</h2>
            <p style={{ color: '#475569', marginTop: 6 }}>New patient registration is separated from login to reduce confusion.</p>
            <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
              <div className="form-row">
                <div>
                  <label>First Name</label>
                  <input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div>
                  <label>Last Name</label>
                  <input value={regLastName} onChange={(e) => setRegLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Gender</label>
                  <select value={regGender} onChange={(e) => setRegGender(e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Date of Birth</label>
                  <input type="date" value={regDateOfBirth} onChange={(e) => setRegDateOfBirth(e.target.value)} />
                </div>
              </div>

              <label>Contact Info</label>
              <input value={regContactInfo} onChange={(e) => setRegContactInfo(e.target.value)} placeholder="Phone number" />

              <label>Email Address</label>
              <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="email@example.com" />

              <label>Cluster Group</label>
              <select value={regClusterGroup} onChange={(e) => setRegClusterGroup(e.target.value)}>
                {clusterOptions.map((option) => (
                  <option key={`register-${option}`} value={option}>
                    {option === '' ? 'Select cluster group' : option}
                  </option>
                ))}
              </select>

              <button type="submit">Register Patient</button>
            </form>
            {registerResult && <p style={{ marginTop: 14 }}>{registerResult}</p>}
          </section>

          <section className="panel-card" id="patient-login">
            <h2>Patient Login</h2>
            <p style={{ color: '#475569', marginTop: 6 }}>Sign in to view patient records and medical history.</p>
            <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
              <label>Full Name</label>
              <input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Jane A. Doe" />

              <label>Cluster Group</label>
              <select value={loginCluster} onChange={(e) => setLoginCluster(e.target.value)}>
                <option value="">Select cluster group</option>
                {clusterOptions.filter(Boolean).map((option) => (
                  <option key={`login-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label>Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

              <button type="submit">Login as Patient</button>
            </form>
            {loginResult && <p style={{ marginTop: 14 }}>{loginResult}</p>}
          </section>
        </div>
      </div>

      {loggedInPatient && (
        <section className="section-card">
          <h2>Patient Records</h2>
          <p style={{ color: '#475569', marginTop: 6 }}>Browse medical history, visits, lab results, prescriptions, nutrition, and pregnancy risk for the logged-in patient.</p>

          <div style={{ display: 'grid', gap: 24, marginTop: 24 }}>
            <div>
              <h3>{loggedInPatient.first_name} {loggedInPatient.last_name}</h3>
              <p><strong>Cluster:</strong> {loggedInPatient.cluster_group}</p>
              <p><strong>Patient ID:</strong> {loggedInPatient.patient_id}</p>
            </div>

            <div className="table-responsive">
              <h4>Medical History</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Condition</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Diagnosis Date</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalHistory.length > 0 ? (
                    medicalHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.condition}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.diagnosis_date}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: 10, border: '1px solid #e2e8f0' }}>No medical history data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-responsive">
              <h4>Visits</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Visit Date</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Reason</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Triage Score</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.length > 0 ? (
                    visits.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.visit_date}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.reason}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.triage_score}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: 10, border: '1px solid #e2e8f0' }}>No visit data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-responsive">
              <h4>Lab Results</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Test Type</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Result</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {labResults.length > 0 ? (
                    labResults.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.test_type}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{JSON.stringify(item.result)}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.uploaded_at}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: 10, border: '1px solid #e2e8f0' }}>No lab results available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-responsive">
              <h4>Prescriptions</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Drug Name</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Dosage</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.length > 0 ? (
                    prescriptions.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.drug_name}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.dosage}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.frequency}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: 10, border: '1px solid #e2e8f0' }}>No prescriptions available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-responsive">
              <h4>Nutrition Assessments</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Assessment Date</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Risk Score</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Recommendations</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionAssessments.length > 0 ? (
                    nutritionAssessments.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.assessment_date}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.risk_score}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.recommendations}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: 10, border: '1px solid #e2e8f0' }}>No nutrition assessments available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-responsive">
              <h4>Pregnancy Risk Assessment</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Assessment Date</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Risk Level</th>
                    <th style={{ padding: 10, border: '1px solid #e2e8f0' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pregnancyRisks.length > 0 ? (
                    pregnancyRisks.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.assessment_date}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.risk_level}</td>
                        <td style={{ padding: 10, border: '1px solid #e2e8f0' }}>{item.notes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: 10, border: '1px solid #e2e8f0' }}>No pregnancy risk data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {status && <p style={{ marginTop: 24 }}>{status}</p>}

      <section className="section-card" style={{ marginTop: 24 }}>
        <h2>Patient List</h2>
        <p style={{ color: '#475569' }}>View patient records that have been added to the system.</p>
        <ul style={{ marginTop: 16, paddingLeft: 20 }}>
          {patients.length > 0 ? (
            patients.map((patient) => (
              <li key={patient.patient_id || patient.id}>
                <strong>{patient.first_name || patient.name}</strong>
                {patient.last_name ? ` ${patient.last_name}` : ''}
                {patient.cluster_group ? ` — ${patient.cluster_group}` : ''}
              </li>
            ))
          ) : (
            <li>No patients found for this cluster filter.</li>
          )}
        </ul>
      </section>
    </Layout>
  );
}
