import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { registerRequest, loginRequest, setToken } from '../lib/api';

export default function StaffRegister() {
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setMessage('Registering...');
    const payload = {
      username,
      name: fullname,
      email,
      password,
      role,
      id_number: idNumber,
      contact_info: contact ? { phone: contact } : undefined,
      biometric_token: null,
    };
    try {
      const res = await registerRequest(payload);
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Registration failed');
        return;
      }
      // Auto-login
      const loginRes = await loginRequest(username, password, null);
      if (!loginRes.ok) {
        setMessage('Registered. Please login manually.');
        return;
      }
      const loginData = await loginRes.json();
      setToken(loginData.access_token);
      setMessage('Registration successful — redirecting to patient registry');
      router.push('/patients');
    } catch (e) {
      setMessage('Registration error');
    }
  };

  return (
    <Layout title="Staff Registration">
      <h1>Register as Staff</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="form">
        <label>
          Full Name
          <input value={fullname} onChange={(e) => setFullname(e.target.value)} />
        </label>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          ID Number
          <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Contact Phone
          <input value={contact} onChange={(e) => setContact(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
          </select>
        </label>
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
      <p>
        Already registered? <a href="/staff-login">Sign in here</a>.
      </p>
    </Layout>
  );
}
