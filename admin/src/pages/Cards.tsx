import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Topic = { id: string; name: string; subject_id: string };
type Card = { id: string; topic_id: string; title: string | null; front_text: string; back_text: string; sort_order: number };

export default function Cards() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [list, setList] = useState<(Card & { topic_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editing, setEditing] = useState<(Card & { topic_name?: string }) | null>(null);
  const [form, setForm] = useState({ topic_id: '', title: '', front_text: '', back_text: '', sort_order: 0 });

  const loadTopics = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('topics').select('id, name, subject_id').order('sort_order');
    setTopics(data ?? []);
    if (data?.length && !form.topic_id) setForm((f) => ({ ...f, topic_id: data[0].id }));
  };

  const load = async () => {
    if (!supabase) return;
    const { data: cards } = await supabase.from('flash_cards').select('*').order('sort_order');
    const { data: topicList } = await supabase.from('topics').select('id, name');
    const topicMap = Object.fromEntries((topicList ?? []).map((t) => [t.id, t.name]));
    setList((cards ?? []).map((c) => ({ ...c, topic_name: topicMap[c.topic_id] })));
    setLoading(false);
  };

  useEffect(() => { loadTopics(); }, []);
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase || !form.topic_id) return;
    const payload = { topic_id: form.topic_id, title: form.title.trim() || null, front_text: form.front_text.trim(), back_text: form.back_text.trim(), sort_order: form.sort_order };
    if (editing) {
      const { error } = await supabase.from('flash_cards').update(payload).eq('id', editing.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Güncellendi.' }); setEditing(null); setForm({ topic_id: form.topic_id, title: '', front_text: '', back_text: '', sort_order: 0 }); load(); }
    } else {
      const { error } = await supabase.from('flash_cards').insert(payload);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Eklendi.' }); setForm({ topic_id: form.topic_id, title: '', front_text: '', back_text: '', sort_order: 0 }); load(); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Silmek istediğinize emin misiniz?')) return;
    await supabase.from('flash_cards').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <h1>Bilgi kartları</h1>
      {message && <div className={`msg ${message.type}`}>{message.text}</div>}
      <div className="card">
        <h2>{editing ? 'Düzenle' : 'Yeni kart'}</h2>
        <form onSubmit={save}>
          <div className="form-row">
            <label>Konu</label>
            <select value={form.topic_id} onChange={(e) => setForm((f) => ({ ...f, topic_id: e.target.value }))} required>
              <option value="">Seçin</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Başlık (opsiyonel)</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Ön metin</label>
            <textarea value={form.front_text} onChange={(e) => setForm((f) => ({ ...f, front_text: e.target.value }))} required rows={3} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label>Arka metin</label>
            <textarea value={form.back_text} onChange={(e) => setForm((f) => ({ ...f, back_text: e.target.value }))} required rows={3} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label>Sıra</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} />
          </div>
          <button type="submit">{editing ? 'Kaydet' : 'Ekle'}</button>
          {editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm({ topic_id: form.topic_id, title: '', front_text: '', back_text: '', sort_order: 0 }); }}>İptal</button>}
        </form>
      </div>
      <div className="card">
        <h2>Liste</h2>
        {loading ? <p>Yükleniyor…</p> : (
          <table>
            <thead>
              <tr><th>Konu</th><th>Ön</th><th>Arka</th><th>Sıra</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>{c.topic_name}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.front_text.slice(0, 50)}…</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.back_text.slice(0, 50)}…</td>
                  <td>{c.sort_order}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => { setEditing(c); setForm({ topic_id: c.topic_id, title: c.title ?? '', front_text: c.front_text, back_text: c.back_text, sort_order: c.sort_order }); }}>Düzenle</button>
                    <button type="button" className="danger" onClick={() => del(c.id)}>Sil</button>
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
