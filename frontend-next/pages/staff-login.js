import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { loginRequest, setToken } from '../lib/api';

export default function StaffLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setMessage('Signing in...');
    try {
      const res = await loginRequest(username, password, null);
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Login failed');
        return;
      }
      const data = await res.json();
      setToken(data.access_token);
      setMessage('Login successful — redirecting to patient registry');
      router.push('/patients');
    } catch (e) {
      setMessage('Login error');
    }
  };

  return (
    <Layout title="Staff Login">
      <h1>Staff Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="form">
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Sign In</button>
      </form>
      <p>{message}</p>
      <p>
        Need an account? <a href="/staff-register">Register as staff</a>.
      </p>
    </Layout>
  );
}
