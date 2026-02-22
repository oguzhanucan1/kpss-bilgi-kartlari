import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Quote = { id: string; text: string; sort_order: number; is_active: boolean };

export default function Motivation() {
  const [list, setList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('motivation_quotes').select('*').order('sort_order');
    setList((data ?? []) as Quote[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [form, setForm] = useState({ text: '', sort_order: 0, is_active: true });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    const payload = { text: form.text.trim(), sort_order: form.sort_order, is_active: form.is_active };
    if (editing) {
      const { error } = await supabase.from('motivation_quotes').update(payload).eq('id', editing.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Söz güncellendi.' }); setEditing(null); setForm({ text: '', sort_order: 0, is_active: true }); load(); }
    } else {
      const { error } = await supabase.from('motivation_quotes').insert(payload);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Söz eklendi.' }); setForm({ text: '', sort_order: 0, is_active: true }); load(); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Bu sözü silmek istediğinize emin misiniz?')) return;
    await supabase.from('motivation_quotes').delete().eq('id', id);
    load();
  };

  return (
    <>
      {message && <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>}
      <div className="card-bankco mb-6">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">{editing ? 'Sözü düzenle' : 'Yeni söz ekle'}</h2>
        <form onSubmit={save} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Metin</label><textarea className="input-field max-w-full min-h-[80px]" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} required placeholder="Motivasyon sözü" rows={3} /></div>
          <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Sıra</label><input className="input-field w-28" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} /></div>
          <div><label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-bgray-700 dark:text-bgray-50"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Aktif (anasayfada gösterilsin)</label></div>
          <div className="flex gap-2"><button type="submit" className="btn-primary">{editing ? 'Kaydet' : 'Ekle'}</button>{editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ text: '', sort_order: 0, is_active: true }); }}>İptal</button>}</div>
        </form>
      </div>
      <div className="card-bankco">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Mevcut sözler</h2>
        {loading ? <p className="text-bgray-600">Yükleniyor…</p> : (
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-bgray-200 dark:border-darkblack-400"><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Metin</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Sıra</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Durum</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50"></th></tr></thead><tbody>{list.map((q) => (<tr key={q.id} className="border-b border-bgray-100 dark:border-darkblack-400 hover:bg-bgray-50 dark:hover:bg-darkblack-500"><td className="max-w-[400px] py-3 text-sm text-bgray-700 dark:text-bgray-50">{q.text}</td><td className="py-3 text-sm">{q.sort_order}</td><td className="py-3 text-sm">{q.is_active ? 'Aktif' : 'Pasif'}</td><td className="py-3"><div className="flex gap-2"><button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => { setEditing(q); setForm({ text: q.text, sort_order: q.sort_order, is_active: q.is_active }); }}>Düzenle</button><button type="button" className="btn-danger !py-1.5 !px-2 text-xs" onClick={() => del(q.id)}>Sil</button></div></td></tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}
