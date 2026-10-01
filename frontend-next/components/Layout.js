import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getToken, getProfile, removeToken } from '../lib/api';

export default function Layout({ title, children }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [lightMode, setLightMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getProfile().then((profile) => {
        if (profile) {
          setUser(profile);
          setLoggedIn(true);
          return;
        }
        setLoggedIn(false);
      });
      return;
    }
    setLoggedIn(false);
  }, []);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setLightMode((value) => {
      const nextValue = !value;
      document.documentElement.classList.toggle('light-mode', nextValue);
      return nextValue;
    });
  };

  return (
    <div className="container">
      <Head>
        <title>{title} | HealthIntelligencePlatform</title>
      </Head>
      <header className="header">
        <div className="brand">
          <Link href="/">
            <h1>HealthIntelligencePlatform</h1>
          </Link>
        </div>

        <nav className="nav-bar">
          {loggedIn && (
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-expanded={sidebarOpen}
              aria-controls="operations-sidebar"
              aria-label={sidebarOpen ? 'Close operations sidebar' : 'Open operations sidebar'}
            >
              {sidebarOpen ? '☰' : '☷'}
            </button>
          )}
          <div className="nav-group">
            {loggedIn && <Link href="/dashboard">Dashboard</Link>}
            <Link href="/triage">Triage</Link>
            <Link href="/diagnose-formdata">FormData Upload</Link>
          </div>

          <div className="nav-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {lightMode ? 'Dark Mode' : 'Light Mode'}
            </button>

            {loggedIn && user && (
              <details className="nav-dropdown profile-dropdown">
                <summary>{user.first_name || user.username || 'Account'}</summary>
                <div className="dropdown-menu">
                  <button type="button" onClick={handleLogout}>Log Out</button>
                </div>
              </details>
            )}
          </div>
        </nav>
      </header>
      <div className={loggedIn ? 'app-frame' : undefined}>
        {loggedIn && (
          <aside id="operations-sidebar" className={`app-sidebar ${sidebarOpen ? 'is-open' : 'is-closed'}`} aria-label="Operations">
            <p className="sidebar-label">Operations</p>
            <Link href="/dashboard" aria-current={router.pathname === '/dashboard' ? 'page' : undefined}>Dashboard</Link>
            <Link href="/devices" aria-current={router.pathname === '/devices' ? 'page' : undefined}>Devices</Link>
            <Link href="/device-telemetry" aria-current={router.pathname === '/device-telemetry' ? 'page' : undefined}>Telemetry</Link>
            <Link href="/failure-prediction" aria-current={router.pathname === '/failure-prediction' ? 'page' : undefined}>Maintenance</Link>
            <Link href="/chartbot" aria-current={router.pathname === '/chartbot' ? 'page' : undefined}>Chatbot</Link>
            <Link href="/chat" aria-current={router.pathname === '/chat' ? 'page' : undefined}>Chat</Link>
          </aside>
        )}
        <main>{children}</main>
      </div>
    </div>
  );
}
