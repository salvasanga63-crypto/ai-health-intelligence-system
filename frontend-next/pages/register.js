import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getToken, registerRequest } from '../lib/api';

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('New Patient');
  const [firstName, setFirstName] = useState('Jane');
  const [middleName, setMiddleName] = useState('A.');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('patient@health.ai');
  const [password, setPassword] = useState('SecurePass123');
  const [role, setRole] = useState('patient');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [gender, setGender] = useState('female');
  const [clusterGroup, setClusterGroup] = useState('general patients');
  const [contactPhone, setContactPhone] = useState('+1234567890');
  const [emailContact, setEmailContact] = useState('patient@health.ai');
  const [emergencyContact, setEmergencyContact] = useState('John Doe');
  const [emergencyPhone, setEmergencyPhone] = useState('+1098765432');
  const [idNumber, setIdNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [biometricToken, setBiometricToken] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (getToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Creating account...');
    const payload = {
      email,
      password,
      role,
      name,
    };

    if (role === 'patient') {
      payload.first_name = firstName;
      payload.middle_name = middleName;
      payload.last_name = lastName;
      payload.date_of_birth = dateOfBirth;
      payload.gender = gender;
      payload.cluster_group = clusterGroup;
      payload.contact_info = { phone: contactPhone, email: emailContact };
      payload.emergency_contact = { name: emergencyContact, phone: emergencyPhone };
    }

    if (['doctor', 'nurse'].includes(role)) {
      payload.id_number = idNumber;
      payload.registration_number = registrationNumber;
      payload.specialization = specialization;
      payload.biometric_token = biometricToken;
    }

    const response = await registerRequest(payload);
    if (!response.ok) {
      const error = await response.json();
      setMessage(error.error || 'Registration failed');
      return;
    }

    setMessage('Account created. Please sign in.');
    router.push('/login');
  };

  return (
    <Layout title="Register">
      <div className="full-width-card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <section className="panel-card">
          <h1>Register</h1>
          <p style={{ color: '#475569', marginTop: 8 }}>Create an account for patients or clinical staff with a cleaner, more structured registration experience.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="form-row" style={{ alignItems: 'flex-end' }}>
              <div>
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="patient">Patient</option>
                  <option value="nurse">Nurse</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" />

            {role === 'patient' && (
              <>
                <div className="form-row-three">
                  <div>
                    <label>First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                  </div>
                  <div>
                    <label>Middle Name</label>
                    <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="A." />
                  </div>
                  <div>
                    <label>Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </div>
                  <div>
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <label>Cluster Group</label>
                <select value={clusterGroup} onChange={(e) => setClusterGroup(e.target.value)}>
                  {clusterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="form-row">
                  <div>
                    <label>Contact Phone</label>
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1234567890" />
                  </div>
                  <div>
                    <label>Contact Email</label>
                    <input type="email" value={emailContact} onChange={(e) => setEmailContact(e.target.value)} placeholder="patient@health.ai" />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Emergency Contact Name</label>
                    <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div>
                    <label>Emergency Contact Phone</label>
                    <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="+1098765432" />
                  </div>
                </div>
              </>
            )}

            {['doctor', 'nurse'].includes(role) && (
              <>
                <label>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" />

                <div className="form-row">
                  <div>
                    <label>ID Number</label>
                    <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Staff ID" />
                  </div>
                  <div>
                    <label>Registration Number</label>
                    <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="Reg #" />
                  </div>
                </div>

                <label>Specialization</label>
                <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Cardiology" />

                <label>Biometric Token</label>
                <input value={biometricToken} onChange={(e) => setBiometricToken(e.target.value)} placeholder="Simulated fingerprint token" />
              </>
            )}

            <button type="submit">Register</button>
          </form>

          {message && <p style={{ marginTop: 18 }}>{message}</p>}
          <p style={{ marginTop: 16, color: '#475569' }}>
            Already registered? <a href="/login">Sign in here</a>.
          </p>
        </section>
      </div>
    </Layout>
  );
}
