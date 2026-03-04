import { useState } from 'react';
import { apiPost } from '../api/client';
import type { EmailCheckResponse, CredentialsCheckResponse } from '../api/types';
import { getAuthUser, clearAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function YoxlaPage() {
  const user = getAuthUser();
  const navigate = useNavigate();

  const [checkEmail, setCheckEmail] = useState('');
  const [emailResult, setEmailResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credResult, setCredResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [credLoading, setCredLoading] = useState(false);

  async function handleCheckEmail() {
    if (!checkEmail.trim()) return;
    setEmailLoading(true);
    setEmailResult(null);
    try {
      const { data } = await apiPost<EmailCheckResponse>('/api/email/check', { email: checkEmail.trim() });
      setEmailResult({ msg: data.message || (data.exists ? 'Sistemdə mövcuddur' : 'Tapılmadı'), ok: data.exists });
    } catch {
      setEmailResult({ msg: 'Xəta baş verdi', ok: false });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleCheckCred() {
    if (!credEmail.trim() || !credPassword) return;
    setCredLoading(true);
    setCredResult(null);
    try {
      const { data } = await apiPost<CredentialsCheckResponse>('/api/check-credentials', {
        email: credEmail.trim(),
        password: credPassword,
      });
      setCredResult({ msg: data.valid ? 'true' : 'false', ok: data.valid });
    } catch {
      setCredResult({ msg: 'Xəta baş verdi', ok: false });
    } finally {
      setCredLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/login-olmaq-ucun-cetin-yol');
  }

  return (
    <div className="yoxla-page">
      <div className="yoxla-container">
        <header className="yoxla-header">
          <h1>Check</h1>
          <nav className="yoxla-nav">
            {user?.role === 'ADMIN' && (
              <a href="/dashboard-girmek-ucun-cetin-yol" className="nav-link">Dashboard</a>
            )}
            {user ? (
              <button className="btn-link" onClick={handleLogout}>Logout</button>
            ) : null}
          </nav>
        </header>

        <main className="yoxla-main">
          <section className="check-section">
            <h2>Check Email</h2>
            <p>Emailin sistemdə mövcud olub-olmadığını yoxla</p>
            <div className="form-inline">
              <input
                type="email"
                value={checkEmail}
                onChange={e => setCheckEmail(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={e => e.key === 'Enter' && handleCheckEmail()}
              />
              <button className="btn btn-primary" onClick={handleCheckEmail} disabled={emailLoading}>
                {emailLoading ? '...' : 'Check'}
              </button>
            </div>
            {emailResult && (
              <div className={`result-box ${emailResult.ok ? 'success' : 'error'}`}>
                {emailResult.msg}
              </div>
            )}
          </section>

          <section className="check-section">
            <h2>Check Credentials</h2>
            <p>Email və şifrəni yoxla</p>
            <div className="form-group">
              <input
                type="email"
                value={credEmail}
                onChange={e => setCredEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={credPassword}
                onChange={e => setCredPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <button className="btn btn-primary" onClick={handleCheckCred} disabled={credLoading}>
              {credLoading ? '...' : 'Check'}
            </button>
            {credResult && (
              <div className={`result-box ${credResult.ok ? 'success' : 'error'}`}>
                {credResult.msg}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
