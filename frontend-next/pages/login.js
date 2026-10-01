import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getToken, startDemoSession } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass123');
  const [biometricToken, setBiometricToken] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (getToken()) {
      router.replace('/triage');
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMessage('Enter any demo username and password to continue.');
      return;
    }
    startDemoSession();
    router.push('/triage');
  };

  return (
    <Layout title="Login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Username or ID Number
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username or staff ID" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          Biometric Token (for nurse/doctor)
          <input value={biometricToken} onChange={(e) => setBiometricToken(e.target.value)} placeholder="Optional" />
        </label>
        <button type="submit">Sign In</button>
      </form>
      <p>{message}</p>
      <p>
        Don&apos;t have an account? <a href="/register">Register here</a>.
      </p>
    </Layout>
  );
}
