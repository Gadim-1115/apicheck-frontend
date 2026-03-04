import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../hooks/useAuth';
import UsersTable from '../components/UsersTable';
import AuditLogsPanel from '../components/AuditLogsPanel';
import { apiPost } from '../api/client';
import type { EmailCheckResponse, CredentialsCheckResponse, UserResponse } from '../api/types';

type Panel = 'check-email' | 'check-credentials' | 'create-user' | 'users' | 'logs';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Panel>('users');

  function handleLogout() {
    clearAuth();
    navigate('/login-olmaq-ucun-cetin-yol');
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Admin Panel</h1>
        <button className="btn-link" onClick={handleLogout}>Logout</button>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {(['check-email', 'check-credentials', 'create-user', 'users', 'logs'] as Panel[]).map(p => (
              <button
                key={p}
                className={`sidebar-item${active === p ? ' active' : ''}`}
                onClick={() => setActive(p)}
              >
                {p === 'check-email' && 'Check Email'}
                {p === 'check-credentials' && 'Check Credentials'}
                {p === 'create-user' && 'Create User'}
                {p === 'users' && 'Users'}
                {p === 'logs' && 'User Logs'}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          {active === 'check-email' && <CheckEmailPanel />}
          {active === 'check-credentials' && <CheckCredentialsPanel />}
          {active === 'create-user' && <CreateUserPanel />}
          {active === 'users' && (
            <section className="dashboard-panel">
              <h2>Users</h2>
              <UsersTable />
            </section>
          )}
          {active === 'logs' && (
            <section className="dashboard-panel">
              <h2>User Logs</h2>
              <AuditLogsPanel />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function CheckEmailPanel() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await apiPost<EmailCheckResponse>('/api/email/check', { email: email.trim() });
      setResult({ msg: data.message || (data.exists ? 'Mövcuddur' : 'Tapılmadı'), ok: data.exists });
    } catch {
      setResult({ msg: 'Xəta baş verdi', ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-panel">
      <h2>Check Email</h2>
      <p>Emailin sistemdə mövcud olub-olmadığını yoxla</p>
      <div className="form-inline">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="email@example.com"
        />
        <button className="btn btn-primary" onClick={handleCheck} disabled={loading}>
          {loading ? '...' : 'Check'}
        </button>
      </div>
      {result && <div className={`result-box ${result.ok ? 'success' : 'error'}`}>{result.msg}</div>}
    </section>
  );
}

function CheckCredentialsPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!email.trim() || !password) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await apiPost<CredentialsCheckResponse>('/api/check-credentials', { email: email.trim(), password });
      setResult({ msg: data.valid ? 'true' : 'false', ok: data.valid });
    } catch {
      setResult({ msg: 'Xəta baş verdi', ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-panel">
      <h2>Check Credentials</h2>
      <p>Email və şifrəni yoxla</p>
      <div className="form-group">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      </div>
      <div className="form-group">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      </div>
      <button className="btn btn-primary" onClick={handleCheck} disabled={loading}>
        {loading ? '...' : 'Check'}
      </button>
      {result && <div className={`result-box ${result.ok ? 'success' : 'error'}`}>{result.msg}</div>}
    </section>
  );
}

function CreateUserPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [active, setActive] = useState('1');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!email || !password) { setMsg({ text: 'Email və şifrə tələb olunur', ok: false }); return; }
    if (password.length < 6) { setMsg({ text: 'Şifrə min 6 simvol olmalıdır', ok: false }); return; }
    setLoading(true);
    setMsg(null);
    try {
      const { data, status } = await apiPost<UserResponse>('/api/users/create', {
        email, password, role, active: parseInt(active),
      });
      if (status === 201) {
        setMsg({ text: `İstifadəçi yaradıldı: ${(data as UserResponse).email}`, ok: true });
        setEmail(''); setPassword('');
      } else {
        setMsg({ text: 'Xəta baş verdi', ok: false });
      }
    } catch {
      setMsg({ text: 'Xəta baş verdi', ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-panel">
      <h2>Create User</h2>
      <div className="create-user-form">
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="form-group">
          <label>Şifrə</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 simvol" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={active} onChange={e => setActive(e.target.value)}>
              <option value="1">Aktiv</option>
              <option value="0">Qeyri-aktiv</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
          {loading ? 'Yaradılır...' : 'Create User'}
        </button>
        {msg && <div className={`result-box ${msg.ok ? 'success' : 'error'}`} style={{ marginTop: '1rem' }}>{msg.text}</div>}
      </div>
    </section>
  );
}
