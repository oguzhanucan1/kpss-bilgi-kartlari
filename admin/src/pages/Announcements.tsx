import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Ann = { id: string; title: string; excerpt: string | null; body: string | null; is_active: boolean; created_at: string };

export default function Announcements() {
  const [list, setList] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editing, setEditing] = useState<Ann | null>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', is_active: true });

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setList((error ? [] : data) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    const payload = { title: form.title.trim(), excerpt: form.excerpt.trim() || null, body: form.body.trim() || null, is_active: form.is_active };
    if (editing) {
      const { error } = await supabase.from('announcements').update(payload).eq('id', editing.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Updated.' }); setEditing(null); setForm({ title: '', excerpt: '', body: '', is_active: true }); load(); }
    } else {
      const { error } = await supabase.from('announcements').insert(payload);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Added.' }); setForm({ title: '', excerpt: '', body: '', is_active: true }); load(); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Delete?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <h1>Duyurular</h1>
      {message && <div className={`msg ${message.type}`}>{message.text}</div>}
      <div className="card">
        <h2>{editing ? 'Edit' : 'New'}</h2>
        <form onSubmit={save}>
          <div className="form-row">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label>Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label>Body (optional)</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={4} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active</label>
          </div>
          <button type="submit">{editing ? 'Save' : 'Add'}</button>
          {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm({ title: '', excerpt: '', body: '', is_active: true }); }}>Cancel</button>}
        </form>
      </div>
      <div className="card">
        <h2>List</h2>
        {loading ? <p>Loading...</p> : (
          <table>
            <thead>
              <tr><th>Title</th><th>Excerpt</th><th>Active</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td style={{ maxWidth: 300 }}>{a.excerpt ?? '-'}</td>
                  <td>{a.is_active ? 'Yes' : 'No'}</td>
                  <td>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => { setEditing(a); setForm({ title: a.title, excerpt: a.excerpt ?? '', body: a.body ?? '', is_active: a.is_active }); }}>Edit</button>
                    <button type="button" className="danger" onClick={() => del(a.id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
