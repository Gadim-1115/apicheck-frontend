import { useState } from 'react';
import { apiGet } from '../api/client';
import type { AuditLogResponse, Page } from '../api/types';

function toBakuTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('az-AZ', { timeZone: 'Asia/Baku' });
}

export default function AuditLogsPanel() {
  const [data, setData] = useState<Page<AuditLogResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [actorEmail, setActorEmail] = useState('');
  const [method, setMethod] = useState('');
  const [pathContains, setPathContains] = useState('');
  const [success, setSuccess] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function loadLogs(p = 0) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), size: '20' });
    if (actorEmail) params.set('actorEmail', actorEmail);
    if (method) params.set('method', method.toUpperCase());
    if (pathContains) params.set('pathContains', pathContains);
    if (success) params.set('success', success);
    if (from) params.set('from', from + ':00');
    if (to) params.set('to', to + ':00');
    try {
      const d = await apiGet<Page<AuditLogResponse>>(`/api/audit-logs?${params}`);
      setData(d);
      setPage(p);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Filterlər tətbiq edin</p>
      <div className="logs-filters">
        <input value={actorEmail} onChange={e => setActorEmail(e.target.value)} placeholder="İstifadəçi email" />
        
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option value="">Bütün Methodlar</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        <input value={pathContains} onChange={e => setPathContains(e.target.value)} placeholder="Path içerir" />
        <select value={success} onChange={e => setSuccess(e.target.value)}>
          <option value="">Hamısı</option>
          <option value="true">Uğurlu</option>
          <option value="false">Uğursuz</option>
        </select>
        <input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="datetime-local" value={to} onChange={e => setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={() => loadLogs(0)}>Yüklə</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p className="text-muted">Yüklənir...</p>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Tarix (Bakı)</th>
                <th>İstifadəçi</th>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Uğur</th>
              </tr>
            </thead>
            <tbody>
              {!data ? (
                <tr><td colSpan={6} className="text-muted">Log yüklənməyib</td></tr>
              ) : data.content.length === 0 ? (
                <tr><td colSpan={6} className="text-muted">Log tapılmadı</td></tr>
              ) : (
                data.content.map(log => (
                  <tr key={log.id}>
                    <td>{toBakuTime(log.createdAt)}</td>
                    <td>{log.actorEmail || '—'}</td>
                    <td><span className={`method-badge method-${log.method?.toLowerCase()}`}>{log.method}</span></td>
                    <td className="path-cell">{log.path}</td>
                    <td>{log.statusCode}</td>
                    <td>
                      <span className={log.success ? 'text-success' : 'text-error'}>
                        {log.success ? 'Bəli' : 'Xeyr'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-btn${i === page ? ' active' : ''}`}
              onClick={() => loadLogs(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
