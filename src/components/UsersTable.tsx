import { useCallback, useEffect, useRef, useState } from 'react';
import { apiDelete, apiGet, apiPatch } from '../api/client';
import type { UserLoginStatsResponse, UserResponse } from '../api/types';
import UserLogsModal from './UserLogsModal';

function LoginCount({ email }: { email: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    apiGet<UserLoginStatsResponse>(`/api/users/${encodeURIComponent(email)}/login-stats`)
      .then(d => setCount(d.loginCount))
      .catch(() => setCount(null));
  }, [email]);
  return <span className="login-count-badge">{count ?? '—'}</span>;
}

export default function UsersTable() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [logsEmail, setLogsEmail] = useState<string | null>(null);

  // Change password modal
  const [cpEmail, setCpEmail] = useState('');
  const [cpPassword, setCpPassword] = useState('');
  const [cpOpen, setCpOpen] = useState(false);
  const [cpError, setCpError] = useState('');

  const searchRef = useRef(search);
  searchRef.current = search;

  const fetchUsers = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q
        ? `/api/users/search/contains?query=${encodeURIComponent(q)}`
        : '/api/users';
      const data = await apiGet<UserResponse[]>(url);
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function applyFilters(list: UserResponse[]): UserResponse[] {
    return list.filter(u => {
      if (filterRole && u.role !== filterRole) return false;
      if (filterStatus === 'active' && !u.active) return false;
      if (filterStatus === 'inactive' && u.active) return false;
      return true;
    });
  }

  async function handleSearch() {
    await fetchUsers(search.trim() || undefined);
  }

  async function handleClear() {
    setSearch('');
    setFilterRole('');
    setFilterStatus('');
    await fetchUsers();
  }

  async function toggleStatus(id: number, currentActive: number) {
    await apiPatch(`/api/users/${id}/status`, { active: currentActive ? 0 : 1 });
    await fetchUsers(search.trim() || undefined);
  }

  async function deleteUser(id: number, email: string) {
    if (!confirm(`${email} silinsin?`)) return;
    await apiDelete(`/api/users/${id}`);
    await fetchUsers(search.trim() || undefined);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setCpError('');
    try {
      const data = await apiPatch<{ success: boolean; message?: string }>(
        '/api/users/change-password',
        { email: cpEmail, newPassword: cpPassword }
      );
      if (data.success) {
        setCpOpen(false);
        setCpPassword('');
      } else {
        setCpError(data.message || 'Xəta baş verdi');
      }
    } catch {
      setCpError('Xəta baş verdi');
    }
  }

  const visible = applyFilters(users);

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Email axtarış (gmail, @example.com...)"
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="filter-select">
          <option value="">Bütün Rollar</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">Bütün Statuslar</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Qeyri-aktiv</option>
        </select>
        <button className="btn btn-secondary" onClick={handleSearch}>Axtar</button>
        <button className="btn btn-outline" onClick={handleClear}>Təmizlə</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p className="text-muted">Yüklənir...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Status</th>
                <th>Login Sayı</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={5} className="text-muted">İstifadəçi tapılmadı</td></tr>
              ) : (
                visible.map(u => (
                  <tr key={u.id}>
                    <td>
                      <button
                        className="user-email-link"
                        onClick={() => setLogsEmail(u.email)}
                      >
                        {u.email}
                      </button>
                    </td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-active' : 'badge-inactive'}`}>
                        {u.active ? 'Aktiv' : 'Qeyri-aktiv'}
                      </span>
                    </td>
                    <td><LoginCount email={u.email} /></td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-status"
                        onClick={() => toggleStatus(u.id, u.active)}
                      >
                        {u.active ? 'Deaktiv et' : 'Aktiv et'}
                      </button>
                      <button
                        className="btn btn-sm btn-change-pass"
                        onClick={() => { setCpEmail(u.email); setCpPassword(''); setCpError(''); setCpOpen(true); }}
                      >
                        Şifrə dəyiş
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => deleteUser(u.id, u.email)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {logsEmail && (
        <UserLogsModal email={logsEmail} onClose={() => setLogsEmail(null)} />
      )}

      {cpOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCpOpen(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Şifrə Dəyiş</h3>
              <button className="modal-close" onClick={() => setCpOpen(false)}>×</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={cpEmail} readOnly />
              </div>
              <div className="form-group">
                <label>Yeni şifrə</label>
                <input
                  type="password"
                  value={cpPassword}
                  onChange={e => setCpPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min 6 simvol"
                />
              </div>
              {cpError && <p className="error-msg">{cpError}</p>}
              <button type="submit" className="btn btn-primary">Dəyiş</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
