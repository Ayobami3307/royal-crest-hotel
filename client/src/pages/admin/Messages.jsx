import { useState } from 'react';
import { api } from '../../api/client';
import Icon from '../../components/Icon';
import { ErrorState, Spinner } from '../../components/States';
import { ConfirmModal, PageHeader, useToast } from '../../components/admin/ui';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { formatDateTime } from '../../utils/format';

export default function Messages() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { data, loading, error, reload } = useApi('/admin/messages', { auth: true });
  const [openId, setOpenId] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const messages = data?.messages || [];

  async function setRead(m, isRead) {
    try {
      await api.patch(`/admin/messages/${m._id}`, { body: { isRead }, auth: true });
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function toggle(m) {
    const next = openId === m._id ? null : m._id;
    setOpenId(next);
    if (next && !m.isRead) setRead(m, true);
  }

  async function remove() {
    setBusy(true);
    try {
      await api.del(`/admin/messages/${del._id}`, { auth: true });
      toast('Message deleted.');
      setDel(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Messages" subtitle="Enquiries, table requests and feedback from the website." />
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Spinner label="Loading messages" />}
      {data && messages.length === 0 && <p className="adm-empty card">No messages yet.</p>}
      {messages.length > 0 && (
        <ul className="inbox card card--flush">
          {messages.map((m) => (
            <li key={m._id} className={`inbox__item ${m.isRead ? '' : 'is-unread'} ${openId === m._id ? 'is-open' : ''}`}>
              <button type="button" className="inbox__head" onClick={() => toggle(m)} aria-expanded={openId === m._id}>
                <span className="inbox__dot" aria-label={m.isRead ? 'Read' : 'Unread'} />
                <span className="inbox__from"><strong>{m.name}</strong><small>{m.email}</small></span>
                <span className="inbox__subject">{m.subject}</span>
                <time>{formatDateTime(m.createdAt)}</time>
              </button>
              {openId === m._id && (
                <div className="inbox__body">
                  <p>{m.message}</p>
                  {m.phone && <p className="muted"><Icon name="phone" size={14} /> {m.phone}</p>}
                  <div className="row-actions">
                    <a className="btn btn--gold btn--sm" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>Reply by email</a>
                    <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setRead(m, !m.isRead)}>Mark as {m.isRead ? 'unread' : 'read'}</button>
                    {isAdmin && <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setDel(m)}><Icon name="trash" size={15} /> Delete</button>}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {del && <ConfirmModal title="Delete message?" message={`The message from ${del.name} will be permanently removed.`} confirmLabel="Delete" danger busy={busy} onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  );
}
