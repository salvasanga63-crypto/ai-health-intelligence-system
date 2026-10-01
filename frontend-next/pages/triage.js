import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { authFetch } from '../lib/api';

const clusterOptions = [
  'lactating mothers',
  'pregnant/expectant mothers',
  'children under 5',
  'children 5-17',
  'women',
  'men',
  'elders',
  'general patients',
];

const providerOptions = ['Dr. Adams', 'Nurse Patel', 'Dr. Kim', 'Nurse Carter'];
const statusOptions = ['Awaiting Review', 'In Consultation', 'Discharged'];

const urgencyLabels = {
  critical: { label: 'Critical', color: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  urgent: { label: 'Urgent', color: '#fef3c7', border: '#f59e0b', text: '#b45309' },
  stable: { label: 'Stable', color: '#dcfce7', border: '#22c55e', text: '#166534' },
};

function getUrgencyLevel(patient) {
  const score = Number(patient.ai_risk_score ?? patient.risk_score ?? 0);
  const hr = Number(patient.heart_rate ?? 0);
  const spo2 = Number(patient.oxygen_saturation ?? 100);
  const temp = Number(patient.temperature ?? 0);

  if (score >= 80 || spo2 > 0 && spo2 < 92 || hr >= 120 || temp >= 39) return 'critical';
  if (score >= 50 || spo2 > 0 && spo2 < 95 || hr >= 100 || temp >= 37.5) return 'urgent';
  return 'stable';
}

function formatVital(value, unit) {
  return value !== undefined && value !== null && value !== '' ? `${value}${unit}` : `--${unit}`;
}

export default function Triage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [nutritionData, setNutritionData] = useState('{}');
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Loading patient queue...');
  const [aiResult, setAiResult] = useState(null);
  const [assignmentMap, setAssignmentMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [expandedClusters, setExpandedClusters] = useState({});
  const [isCreatingPatient, setIsCreatingPatient] = useState(true);
  const [newPatientFirstName, setNewPatientFirstName] = useState('');
  const [newPatientLastName, setNewPatientLastName] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('female');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientCluster, setNewPatientCluster] = useState('general patients');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientNotes, setNewPatientNotes] = useState('');
  const [newPatientErrors, setNewPatientErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await authFetch('/patients');
        if (!response.ok) {
          setStatusMessage('Unable to load patient queue. Please log in or refresh.');
          setPatients([]);
          return;
        }

        const data = await response.json();
        setPatients(Array.isArray(data) ? data : []);
        setStatusMessage('');
      } catch {
        setStatusMessage('Patient service unavailable. Start the backend or refresh to retry.');
        setPatients([]);
      }
    }

    loadPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].patient_id ?? patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.patient_id === selectedPatientId || patient.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  useEffect(() => {
    if (!selectedPatient) return;
    setSymptoms(selectedPatient.symptoms || '');
    setHistory(selectedPatient.history || selectedPatient.medical_history || '');
    setNutritionData(selectedPatient.nutrition_data || '{}');
    setAiResult(selectedPatient.ai_assessment || null);
  }, [selectedPatient]);

  const queue = useMemo(() => {
    const filtered = patients.filter((patient) => {
      const name = `${patient.first_name ?? patient.name ?? ''} ${patient.last_name ?? ''}`.toLowerCase();
      const patientId = String(patient.patient_id ?? patient.id ?? '').toLowerCase();
      const query = searchTerm.toLowerCase();
      return name.includes(query) || patientId.includes(query) || (patient.cluster_group ?? '').toLowerCase().includes(query);
    });

    return filtered
      .map((patient) => ({
        ...patient,
        urgency: getUrgencyLevel(patient),
      }))
      .sort((a, b) => {
        const order = { critical: 0, urgent: 1, stable: 2 };
        const delta = order[a.urgency] - order[b.urgency];
        if (delta !== 0) return delta;
        return (a.last_name ?? a.name ?? '').localeCompare(b.last_name ?? b.name ?? '');
      });
  }, [patients, searchTerm]);

  const groupedQueue = useMemo(() => {
    return queue.reduce((groups, patient) => {
      const cluster = patient.cluster_group || 'general patients';
      groups[cluster] = groups[cluster] || [];
      groups[cluster].push(patient);
      return groups;
    }, {});
  }, [queue]);

  const selectedAssignment = selectedPatientId ? assignmentMap[selectedPatientId] : providerOptions[0];
  const selectedStatus = selectedPatientId ? statusMap[selectedPatientId] : 'Awaiting Review';

  const sortedClusters = useMemo(() => {
    const counts = patients.reduce((acc, patient) => {
      const cluster = patient.cluster_group || 'general patients';
      acc[cluster] = (acc[cluster] || 0) + 1;
      return acc;
    }, {});

    return [...clusterOptions].sort((a, b) => {
      const countA = counts[a] || 0;
      const countB = counts[b] || 0;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b);
    });
  }, [patients]);

  const topCluster = useMemo(() => {
    return sortedClusters[0] || 'general patients';
  }, [sortedClusters]);

  const handleToggleCluster = (cluster) => {
    setExpandedClusters((prev) => ({ ...prev, [cluster]: !prev[cluster] }));
  };

  const handleStartNewPatient = () => {
    setIsCreatingPatient(true);
    setSelectedPatientId(null);
    setNewPatientFirstName('');
    setNewPatientLastName('');
    setNewPatientGender('female');
    setNewPatientDob('');
    setNewPatientCluster(topCluster);
    setNewPatientPhone('');
    setNewPatientEmail('');
    setNewPatientNotes('');
    setNewPatientErrors({});
    setAiResult(null);
  };

  const handleCreatePatient = async (event) => {
    event.preventDefault();
    setStatusMessage('Creating new patient...');
    // client-side validation
    const errs = {};
    if (!newPatientFirstName || !newPatientFirstName.trim()) errs.first_name = 'First name is required';
    if (!newPatientLastName || !newPatientLastName.trim()) errs.last_name = 'Last name is required';
    if (!newPatientDob) errs.date_of_birth = 'Date of birth is required';
    if (!newPatientCluster) errs.cluster_group = 'Cluster group is required';
    if (newPatientEmail && !/^\S+@\S+\.\S+$/.test(newPatientEmail)) errs.email = 'Invalid email address';
    if (newPatientPhone && !/^\+?[0-9\s\-]{7,15}$/.test(newPatientPhone)) errs.phone = 'Invalid phone number';

    setNewPatientErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStatusMessage('Please fix the highlighted errors.');
      return;
    }

    const response = await authFetch('/patients', {
      method: 'POST',
      body: JSON.stringify({
        first_name: newPatientFirstName,
        last_name: newPatientLastName,
        gender: newPatientGender,
        date_of_birth: newPatientDob,
        contact_info: { phone: newPatientPhone, email: newPatientEmail },
        cluster_group: newPatientCluster,
        medical_history: newPatientNotes,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      // Handle server-side validation errors if provided
      if (data && data.errors && typeof data.errors === 'object') {
        setNewPatientErrors(data.errors);
        setStatusMessage('Please fix the highlighted errors.');
        return;
      }

      setStatusMessage(data.error || 'Unable to create patient.');
      return;
    }

    setNewPatientErrors({});
    setPatients((prev) => [...prev, data]);
    setIsCreatingPatient(false);
    setSelectedPatientId(data.patient_id ?? data.id);
    setStatusMessage('New patient created and added to triage.');
    setToastMessage('Patient created');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.patient_id ?? patient.id);
    setAiResult(patient.ai_assessment || null);
  };

  const handleAssignProvider = (value) => {
    if (!selectedPatientId) return;
    setAssignmentMap((prev) => ({ ...prev, [selectedPatientId]: value }));
  };

  const handleChangeStatus = (value) => {
    if (!selectedPatientId) return;
    setStatusMap((prev) => ({ ...prev, [selectedPatientId]: value }));
  };

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
  };

  useEffect(() => {
    if (!isCreatingPatient) return;

    const previousActiveElement = document.activeElement;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsCreatingPatient(false);
        return;
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(modalRef.current.querySelectorAll(focusableSelector)).filter(
          (el) => !el.hasAttribute('disabled'),
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => {
      const firstInput = modalRef.current?.querySelector('input, select, textarea, button');
      firstInput?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [isCreatingPatient]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPatient) {
      setStatusMessage('Select a patient before requesting AI diagnosis.');
      return;
    }

    setStatusMessage('Submitting intake data to AI diagnosis...');
    setAiResult(null);

    const formData = new FormData();
    formData.append('symptoms', symptoms);
    formData.append('history', history);
    formData.append('nutrition_data', nutritionData);
    formData.append('patient_id', selectedPatient.patient_id ?? selectedPatient.id ?? '');
    formData.append('assigned_provider', selectedAssignment);
    if (file) {
      formData.append('file', file);
    }

    const response = await authFetch('/diagnose', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      setStatusMessage(data.error || 'AI diagnosis failed.');
      return;
    }

    const updatedPatients = patients.map((patient) => {
      const id = patient.patient_id ?? patient.id;
      if (id !== selectedPatientId) return patient;
      return {
        ...patient,
        ai_risk_score: data.risk_score ?? data.confidence ?? patient.ai_risk_score,
        ai_assessment: data,
        triage_category: data.risk_level || getUrgencyLevel(patient),
      };
    });

    setPatients(updatedPatients);
    setAiResult(data);
    setStatusMessage('AI diagnosis updated. Patient urgency refreshed.');
  };

  return (
    <Layout title="Patient Triage">
      <div className="full-width-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1>Patient Triage</h1>
            <p style={{ color: '#475569', maxWidth: 640, marginTop: 8 }}>
              Use this section to search for existing patients or clusters, review medical records, or register a new patient into the system.
            </p>
          </div>
          <div style={{ minWidth: 200, alignSelf: 'center' }}>
            <span className="userBadge">Action Center</span>
          </div>
        </div>
            
        <div className="triage-grid">
          <aside className="queue-card">
            <div className="queue-header">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="search"
                  placeholder="Search Patient by Name, ID, or Cluster (e.g., children under 5)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ minWidth: 180, flex: '1 1 auto' }}
                />
              </div>
            </div>

            {statusMessage && !patients.length ? (
              <p style={{ color: '#475569', marginTop: 16 }}>{statusMessage}</p>
            ) : null}

            <div className="queue-list">
              {Object.keys(groupedQueue).length > 0 ? (
                Object.entries(groupedQueue).map(([cluster, patientsInCluster]) => {
                  const isExpanded = expandedClusters[cluster] ?? true;
                  return (
                    <div key={cluster} className="cluster-group">
                      <button
                        type="button"
                        className="cluster-header"
                        onClick={() => handleToggleCluster(cluster)}
                      >
                        <span>{isExpanded ? '▼' : '▶'} {cluster} ({patientsInCluster.length})</span>
                      </button>
                      {isExpanded && (
                        <div className="cluster-patients">
                          {patientsInCluster.map((patient) => {
                            const urgency = urgencyLabels[getUrgencyLevel(patient)];
                            const isSelected = (patient.patient_id ?? patient.id) === selectedPatientId;
                            return (
                              <button
                                type="button"
                                key={patient.patient_id ?? patient.id}
                                className={`queue-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectPatient(patient)}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                  <div>
                                    <div className="queue-name">
                                      {patient.first_name ?? patient.name ?? 'Patient'} {patient.last_name ?? ''}
                                    </div>
                                    <div className="queue-subtitle">{patient.cluster_group || 'General patients'}</div>
                                  </div>
                                  <span className="urgency-badge" style={{ background: urgency.color, borderColor: urgency.border, color: urgency.text }}>
                                    {urgency.label}
                                  </span>
                                </div>

                                <div className="vitals-row">
                                  <span>HR: {formatVital(patient.heart_rate, 'bpm')}</span>
                                  <span>SpO2: {formatVital(patient.oxygen_saturation, '%')}</span>
                                  <span>Temp: {formatVital(patient.temperature, '°C')}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p style={{ color: '#475569', marginTop: 18 }}>No patients found in the queue.</p>
              )}
            </div>
          </aside>

          <section className="triage-detail">
            {selectedPatient ? (
              <>
                <div className="detail-card">
                  <div className="detail-header">
                    <div>
                      <h2>{selectedPatient.first_name ?? selectedPatient.name ?? 'Unnamed patient'} {selectedPatient.last_name ?? ''}</h2>
                      <p style={{ color: '#475569', marginTop: 6 }}>
                        Cluster group: {selectedPatient.cluster_group || 'General patients'}
                      </p>
                    </div>
                    <div className="status-actions">
                      <div>
                        <label>Assign to</label>
                        <select value={selectedAssignment} onChange={(e) => handleAssignProvider(e.target.value)}>
                          {providerOptions.map((provider) => (
                            <option key={provider} value={provider}>{provider}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Status</label>
                        <select value={selectedStatus} onChange={(e) => handleChangeStatus(e.target.value)}>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="vitals-panel">
                    <div className="vitals-pill">
                      <strong>HR</strong>
                      <span>{formatVital(selectedPatient.heart_rate, 'bpm')}</span>
                    </div>
                    <div className="vitals-pill">
                      <strong>BP</strong>
                      <span>{selectedPatient.blood_pressure || '--'}</span>
                    </div>
                    <div className="vitals-pill">
                      <strong>SpO2</strong>
                      <span>{formatVital(selectedPatient.oxygen_saturation, '%')}</span>
                    </div>
                    <div className="vitals-pill">
                      <strong>Temp</strong>
                      <span>{formatVital(selectedPatient.temperature, '°C')}</span>
                    </div>
                  </div>

                  <div className="quick-actions">
                    <a href={`/chat?patientId=${selectedPatient.patient_id ?? selectedPatient.id}`} className="small-link">
                      Open Clinical Chat
                    </a>
                    <button type="button" onClick={() => handleChangeStatus('In Consultation')}>
                      Mark In Consultation
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="detail-card" style={{ marginTop: 24 }}>
                  <h3>Clinical Intake & AI Diagnosis</h3>

                  <label>
                    Symptoms (comma-separated)
                    <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} />
                  </label>

                  <label>
                    Medical history / notes
                    <textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={3} />
                  </label>

                  <div className="split-row">
                    <label>
                      Nutrition data (JSON)
                      <textarea value={nutritionData} onChange={(e) => setNutritionData(e.target.value)} rows={6} />
                    </label>
                    <label>
                      Upload medical file
                      <input type="file" onChange={handleFileChange} />
                      {file && <p style={{ marginTop: 8, color: '#475569' }}>Selected file: {file.name}</p>}
                    </label>
                  </div>

                  <button type="submit">Get AI Diagnosis</button>
                  {statusMessage && <p style={{ marginTop: 12 }}>{statusMessage}</p>}
                </form>

                <section className="detail-card" style={{ marginTop: 24 }}>
                  <h3>AI Risk Summary</h3>
                  {aiResult ? (
                    <>
                      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                        <div>
                          <strong>Risk score:</strong> {aiResult.risk_score ?? aiResult.confidence ?? 'Unavailable'}
                        </div>
                        <div>
                          <strong>Diagnosis:</strong> {aiResult.condition || aiResult.diagnosis || 'Pending assessment'}
                        </div>
                        <div>
                          <strong>Suggested action:</strong> {aiResult.recommendation || aiResult.suggestion || 'Review patient data and escalate if needed.'}
                        </div>
                        {aiResult.nutrition_note && (
                          <div>
                            <strong>Nutrition note:</strong> {aiResult.nutrition_note}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#475569', marginTop: 12 }}>Complete the intake form and submit to refresh the AI assessment.</p>
                  )}
                </section>
              </>
            ) : null}
          </section>
          {isCreatingPatient && (
            <div
              className="registration-panel"
              aria-labelledby="newPatientModalTitle"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setIsCreatingPatient(false);
                }
              }}
            >
              <div className="modal" ref={modalRef}>
                <div className="modal-header">
                  <h3 id="newPatientModalTitle">Register Patient</h3>
                  <button className="modal-close" type="button" onClick={() => setIsCreatingPatient(false)}>✕</button>
                </div>
                <form onSubmit={handleCreatePatient} style={{ marginTop: 8 }}>
                  <div className="form-row">
                    <div>
                      <label>First Name</label>
                      <input className={newPatientErrors.first_name ? 'input-error' : ''} value={newPatientFirstName} onChange={(e) => setNewPatientFirstName(e.target.value)} placeholder="First name" />
                      {newPatientErrors.first_name && <div className="error-text">{newPatientErrors.first_name}</div>}
                    </div>
                    <div>
                      <label>Last Name</label>
                      <input className={newPatientErrors.last_name ? 'input-error' : ''} value={newPatientLastName} onChange={(e) => setNewPatientLastName(e.target.value)} placeholder="Last name" />
                      {newPatientErrors.last_name && <div className="error-text">{newPatientErrors.last_name}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div>
                      <label>Gender</label>
                      <select value={newPatientGender} onChange={(e) => setNewPatientGender(e.target.value)}>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label>Date of Birth</label>
                      <input className={newPatientErrors.date_of_birth ? 'input-error' : ''} type="date" value={newPatientDob} onChange={(e) => setNewPatientDob(e.target.value)} />
                      {newPatientErrors.date_of_birth && <div className="error-text">{newPatientErrors.date_of_birth}</div>}
                    </div>
                  </div>

                  <label>Cluster Group</label>
                  <select className={newPatientErrors.cluster_group ? 'input-error' : ''} value={newPatientCluster} onChange={(e) => setNewPatientCluster(e.target.value)}>
                    {sortedClusters.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {newPatientErrors.cluster_group && <div className="error-text">{newPatientErrors.cluster_group}</div>}

                  <div className="form-row" style={{ marginTop: 12 }}>
                    <div>
                      <label>Phone</label>
                      <input className={newPatientErrors.phone ? 'input-error' : ''} value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} placeholder="Phone number" />
                      {newPatientErrors.phone && <div className="error-text">{newPatientErrors.phone}</div>}
                    </div>
                    <div>
                      <label>Email</label>
                      <input className={newPatientErrors.email ? 'input-error' : ''} type="email" value={newPatientEmail} onChange={(e) => setNewPatientEmail(e.target.value)} placeholder="email@example.com" />
                      {newPatientErrors.email && <div className="error-text">{newPatientErrors.email}</div>}
                    </div>
                  </div>

                  <label>Notes / Medical history</label>
                  <textarea value={newPatientNotes} onChange={(e) => setNewPatientNotes(e.target.value)} rows={4} />

                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button type="submit">Register Patient</button>
                    <button type="button" onClick={() => setIsCreatingPatient(false)} style={{ background: '#6b7280' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showToast && (
            <div className="toast">{toastMessage}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
