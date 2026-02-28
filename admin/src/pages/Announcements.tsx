import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RichTextEditor } from '../components/RichTextEditor';

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
      else { setMessage({ type: 'success', text: 'Duyuru güncellendi.' }); setEditing(null); setForm({ title: '', excerpt: '', body: '', is_active: true }); load(); }
    } else {
      const { error } = await supabase.from('announcements').insert(payload);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Duyuru eklendi.' }); setEditing(null); setForm({ title: '', excerpt: '', body: '', is_active: true }); load(); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    load();
  };

  const toggleActive = async (a: Ann) => {
    if (!supabase) return;
    const { error } = await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id);
    if (!error) load();
  };

  return (
    <>
      {message && <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>}
      <div className="card-bankco mb-6">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">{editing ? 'Duyuruyu düzenle' : 'Yeni duyuru'}</h2>
        <form onSubmit={save} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Başlık</label><input className="input-field max-w-full" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required placeholder="Duyuru başlığı" /></div>
          <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Özet (kısa metin)</label><RichTextEditor key={`excerpt-${editing?.id ?? 'new'}`} value={form.excerpt} onChange={(v) => setForm((f) => ({ ...f, excerpt: v }))} placeholder="Listede görünecek kısa metin" height={100} /></div>
          <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">İçerik (opsiyonel)</label><RichTextEditor key={`body-${editing?.id ?? 'new'}`} value={form.body} onChange={(v) => setForm((f) => ({ ...f, body: v }))} placeholder="Detaylı metin" height={180} /></div>
          <div><label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-bgray-700 dark:text-bgray-50"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Aktif (anasayfada gösterilsin)</label></div>
          <div className="flex gap-2"><button type="submit" className="btn-primary">{editing ? 'Kaydet' : 'Ekle'}</button>{editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ title: '', excerpt: '', body: '', is_active: true }); }}>İptal</button>}</div>
        </form>
      </div>
      <div className="card-bankco">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Mevcut duyurular</h2>
        {loading ? <p className="text-bgray-600">Yükleniyor…</p> : (
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-bgray-200 dark:border-darkblack-400"><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Başlık</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Özet</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Durum</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Tarih</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50"></th></tr></thead><tbody>{list.map((a) => (<tr key={a.id} className="border-b border-bgray-100 dark:border-darkblack-400 hover:bg-bgray-50 dark:hover:bg-darkblack-500"><td className="py-3 text-sm font-medium text-bgray-900 dark:text-white">{a.title}</td><td className="max-w-[300px] py-3 text-sm text-bgray-700 dark:text-bgray-50">{a.excerpt ?? '–'}</td><td className="py-3"><button type="button" onClick={() => toggleActive(a)} className={`rounded-full px-3 py-1 text-xs font-semibold ${a.is_active ? 'bg-success-100 text-success-400 dark:bg-success-300/20 dark:text-success-200' : 'bg-bgray-200 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-50'}`}>{a.is_active ? 'Aktif' : 'Pasif'}</button></td><td className="py-3 text-sm text-bgray-600 dark:text-bgray-50">{new Date(a.created_at).toLocaleDateString('tr-TR')}</td><td className="py-3"><div className="flex gap-2"><button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => { setEditing(a); setForm({ title: a.title, excerpt: a.excerpt ?? '', body: a.body ?? '', is_active: a.is_active }); }}>Düzenle</button><button type="button" className="btn-danger !py-1.5 !px-2 text-xs" onClick={() => del(a.id)}>Sil</button></div></td></tr>))}</tbody></table></div>
        )}
      </div>
    </>
  );
}
