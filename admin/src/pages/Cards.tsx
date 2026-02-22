import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../lib/supabase';

type Subject = { id: string; name: string };
type Topic = { id: string; name: string; subject_id: string };
type Card = { id: string; topic_id: string; title: string | null; front_text: string; back_text: string; sort_order: number };

const modules = {
  toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']],
};

export default function Cards() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editing, setEditing] = useState<Card | null>(null);
  const [form, setForm] = useState({ title: '', front_text: '', back_text: '', sort_order: 0 });

  const loadSubjects = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('subjects').select('id, name').order('sort_order');
    setSubjects((data ?? []) as Subject[]);
    setLoading(false);
  };

  const loadTopics = async (subjectId: string) => {
    if (!supabase) return;
    if (!subjectId) { setTopics([]); return; }
    const { data } = await supabase.from('topics').select('id, name, subject_id').eq('subject_id', subjectId).order('sort_order');
    setTopics((data ?? []) as Topic[]);
  };

  const loadCards = async (topicId: string) => {
    if (!supabase) return;
    setCardLoading(true);
    if (!topicId) { setCards([]); setCardLoading(false); return; }
    const { data } = await supabase.from('flash_cards').select('*').eq('topic_id', topicId).order('sort_order');
    setCards((data ?? []) as Card[]);
    setCardLoading(false);
  };

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { if (selectedSubjectId) loadTopics(selectedSubjectId); else setTopics([]); }, [selectedSubjectId]);
  useEffect(() => { if (selectedTopicId) loadCards(selectedTopicId); else setCards([]); }, [selectedTopicId]);

  const step1Done = !!selectedSubjectId;
  const step2Done = !!selectedTopicId;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase || !selectedTopicId) return;
    const payload = {
      topic_id: selectedTopicId,
      title: form.title.trim() || null,
      front_text: form.front_text.trim() || '',
      back_text: form.back_text.trim() || '',
      sort_order: form.sort_order,
    };
    if (editing) {
      const { error } = await supabase.from('flash_cards').update(payload).eq('id', editing.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Kart güncellendi.' }); setEditing(null); setForm({ title: '', front_text: '', back_text: '', sort_order: 0 }); loadCards(selectedTopicId); }
    } else {
      const { error } = await supabase.from('flash_cards').insert(payload);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Kart eklendi.' }); setForm({ title: '', front_text: '', back_text: '', sort_order: 0 }); loadCards(selectedTopicId); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Bu kartı silmek istediğinize emin misiniz?')) return;
    await supabase.from('flash_cards').delete().eq('id', id);
    loadCards(selectedTopicId);
  };

  return (
    <>
      {message && <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>}

      <div className="mb-6 flex flex-wrap gap-2">
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${step1Done ? 'bg-success-50 text-success-400 dark:bg-success-300/20' : selectedSubjectId ? 'bg-success-300 text-white' : 'bg-bgray-200 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-50'}`}>1. Ders seçin</span>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${step2Done ? 'bg-success-50 text-success-400 dark:bg-success-300/20' : selectedTopicId ? 'bg-success-300 text-white' : 'bg-bgray-200 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-50'}`}>2. Konu seçin</span>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedTopicId ? 'bg-success-300 text-white' : 'bg-bgray-200 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-50'}`}>3. Kart ekleyin / düzenleyin</span>
      </div>

      <div className="card-bankco mb-6">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Ders ve konu</h2>
        <div className="flex flex-wrap items-end gap-6">
          <div className="min-w-[200px]"><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Ders</label><select className="input-field" value={selectedSubjectId} onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTopicId(''); }}><option value="">Ders seçin</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="min-w-[220px]"><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Konu</label><select className="input-field" value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} disabled={!selectedSubjectId}><option value="">Konu seçin</option>{topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        </div>
      </div>

      {selectedTopicId && (
        <>
          <div className="card-bankco mb-6">
            <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">{editing ? 'Kartı düzenle' : 'Yeni kart ekle'}</h2>
            <form onSubmit={save} className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Başlık (opsiyonel)</label><input className="input-field max-w-full" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Kart başlığı" /></div>
              <div><span className="mb-1 block text-sm font-semibold text-bgray-700 dark:text-bgray-50">Kartın ön yüzü</span><p className="mb-2 text-xs text-bgray-600 dark:text-bgray-50">Kullanıcı kartı ilk gördüğünde görünen metin.</p><div className="rich-editor-wrap max-w-3xl"><ReactQuill theme="snow" value={form.front_text} onChange={(v) => setForm((f) => ({ ...f, front_text: v }))} modules={modules} placeholder="Ön yüz metni..." /></div></div>
              <div><span className="mb-1 block text-sm font-semibold text-bgray-700 dark:text-bgray-50">Kartın arka yüzü</span><p className="mb-2 text-xs text-bgray-600 dark:text-bgray-50">Kullanıcı kartı çevirdiğinde (kaydırınca) görünen metin.</p><div className="rich-editor-wrap max-w-3xl"><ReactQuill theme="snow" value={form.back_text} onChange={(v) => setForm((f) => ({ ...f, back_text: v }))} modules={modules} placeholder="Arka yüz metni..." /></div></div>
              <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Sıra</label><input className="input-field w-28" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} /></div>
              <div className="flex gap-2"><button type="submit" className="btn-primary">{editing ? 'Kaydet' : 'Ekle'}</button>{editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ title: '', front_text: '', back_text: '', sort_order: 0 }); }}>İptal</button>}</div>
            </form>
          </div>

          <div className="card-bankco">
            <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Bu konudaki kartlar</h2>
            {cardLoading ? <p className="text-bgray-600">Yükleniyor…</p> : (
              <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-bgray-200 dark:border-darkblack-400"><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Ön (özet)</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Arka (özet)</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Sıra</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50"></th></tr></thead><tbody>{cards.map((c) => (<tr key={c.id} className="border-b border-bgray-100 dark:border-darkblack-400 hover:bg-bgray-50 dark:hover:bg-darkblack-500"><td className="max-w-[280px] py-3 text-sm text-bgray-700 dark:text-bgray-50">{String(c.front_text).replace(/<[^>]*>/g, ' ').trim().slice(0, 80)}{(c.front_text || '').length > 80 ? '…' : ''}</td><td className="max-w-[280px] py-3 text-sm text-bgray-700 dark:text-bgray-50">{String(c.back_text).replace(/<[^>]*>/g, ' ').trim().slice(0, 80)}{(c.back_text || '').length > 80 ? '…' : ''}</td><td className="py-3 text-sm">{c.sort_order}</td><td className="py-3"><div className="flex gap-2"><button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => { setEditing(c); setForm({ title: c.title ?? '', front_text: c.front_text, back_text: c.back_text, sort_order: c.sort_order }); }}>Düzenle</button><button type="button" className="btn-danger !py-1.5 !px-2 text-xs" onClick={() => del(c.id)}>Sil</button></div></td></tr>))}</tbody></table></div>
            )}
            {!cardLoading && cards.length === 0 && <p className="text-bgray-600 dark:text-bgray-50">Bu konuda henüz kart yok. Yukarıdan ekleyebilirsiniz.</p>}
          </div>
        </>
      )}

      {!selectedTopicId && (
        <div className="card-bankco">
          <p className="text-bgray-600 dark:text-bgray-50">Önce yukarıdan bir ders, sonra konu seçin. Seçtikten sonra kart ekleyebilir ve listeleyebilirsiniz.</p>
        </div>
      )}
    </>
  );
}
