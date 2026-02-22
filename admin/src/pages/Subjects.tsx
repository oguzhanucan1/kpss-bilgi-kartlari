import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Subject = { id: string; name: string; slug: string; sort_order: number };

export default function Subjects() {
  const [list, setList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', sort_order: 0 });

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('subjects').select('*').order('sort_order');
    setList((data ?? []) as Subject[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    const slug = form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (editing) {
      const { error } = await supabase.from('subjects').update({ name: form.name.trim(), slug, sort_order: form.sort_order }).eq('id', editing.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Guncellendi.' }); setEditing(null); setForm({ name: '', slug: '', sort_order: 0 }); load(); }
    } else {
      const { error } = await supabase.from('subjects').insert({ name: form.name.trim(), slug, sort_order: form.sort_order });
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Eklendi.' }); setForm({ name: '', slug: '', sort_order: 0 }); load(); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Silinsin mi?')) return;
    await supabase.from('subjects').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <h1>Dersler</h1>
      {message && <div className={`msg ${message.type}`}>{message.text}</div>}
      <div className="card">
        <h2>{editing ? 'Duzenle' : 'Yeni ders'}</h2>
        <form onSubmit={save}>
          <div className="form-row"><label>Ad</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
          <div className="form-row"><label>Slug</label><input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
          <div className="form-row"><label>Sira</label><input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} /></div>
          <button type="submit">{editing ? 'Kaydet' : 'Ekle'}</button>
          {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm({ name: '', slug: '', sort_order: 0 }); }}>Iptal</button>}
        </form>
      </div>
      <div className="card">
        <h2>Liste</h2>
        {loading ? <p>Yukleniyor</p> : (
          <table>
            <thead><tr><th>Ad</th><th>Slug</th><th>Sira</th><th></th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td><td>{s.slug}</td><td>{s.sort_order}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => { setEditing(s); setForm({ name: s.name, slug: s.slug, sort_order: s.sort_order }); }}>Duzenle</button>
                    <button type="button" className="danger" onClick={() => del(s.id)}>Sil</button>
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
