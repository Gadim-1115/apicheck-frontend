import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api/client';
import type { LoginResponse } from '../api/types';
import { setAuthUser } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, status } = await apiPost<LoginResponse>('/api/login', { email, password });
      if (data.success && data.token && data.email && data.role) {
        setAuthUser({ email: data.email, role: data.role, token: data.token });
        navigate(data.role === 'ADMIN' ? '/dashboard-girmek-ucun-cetin-yol' : '/yoxla-girmek-ucun-cetin-yol');
      } else {
        setError(data.message || (status === 401 ? 'Email və ya şifrə yanlışdır' : 'Giriş uğursuz oldu'));
      }
    } catch {
      setError('Serverlə əlaqə qurulmadı');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Daxil olunur...' : 'Login'}
          </button>
        </form>
        <p className="auth-footer"><a href="/yoxla-girmek-ucun-cetin-yol">Check səhifəsinə get</a></p>
      </div>
    </div>
  );
}
