import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { AuditLogResponse, Page } from '../api/types';

interface Props {
  email: string;
  onClose: () => void;
}

function toBakuTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('az-AZ', { timeZone: 'Asia/Baku' });
}

export default function UserLogsModal({ email, onClose }: Props) {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<AuditLogResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    setPage(0);
  }, [email]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      size: String(pageSize),
      actorEmail: email,
    });
    apiGet<Page<AuditLogResponse>>(`/api/audit-logs?${params}`)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [email, page]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-wide">
        <div className="modal-header">
          <h3>Logs: {email}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <p className="text-muted">Yüklənir...</p>
          ) : (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Tarix (Bakı)</th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th>Uğur</th>
                </tr>
              </thead>
              <tbody>
                {data?.content.length === 0 ? (
                  <tr><td colSpan={5} className="text-muted">Log tapılmadı</td></tr>
                ) : (
                  data?.content.map(log => (
                    <tr key={log.id}>
                      <td>{toBakuTime(log.createdAt)}</td>
                      <td><span className={`method-badge method-${log.method.toLowerCase()}`}>{log.method}</span></td>
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
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
