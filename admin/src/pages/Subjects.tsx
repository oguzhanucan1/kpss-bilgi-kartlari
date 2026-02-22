import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Subject = { id: string; name: string; slug: string; sort_order: number };
type Topic = { id: string; subject_id: string; name: string; slug: string; sort_order: number };

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicLoading, setTopicLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', slug: '', sort_order: 0 });
  const [topicForm, setTopicForm] = useState({ name: '', slug: '', sort_order: 0 });

  const loadSubjects = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('subjects').select('*').order('sort_order');
    setSubjects((data ?? []) as Subject[]);
    setLoading(false);
  };

  const loadTopics = async (subjectId: string | null) => {
    if (!supabase) return;
    setTopicLoading(true);
    if (!subjectId) { setTopics([]); setTopicLoading(false); return; }
    const { data } = await supabase.from('topics').select('*').eq('subject_id', subjectId).order('sort_order');
    setTopics((data ?? []) as Topic[]);
    setTopicLoading(false);
  };

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { loadTopics(selectedSubjectId); }, [selectedSubjectId]);

  const saveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    const slug = subjectForm.slug.trim() || subjectForm.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (editingSubject) {
      const { error } = await supabase.from('subjects').update({ name: subjectForm.name.trim(), slug, sort_order: subjectForm.sort_order }).eq('id', editingSubject.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Ders güncellendi.' }); setEditingSubject(null); setSubjectForm({ name: '', slug: '', sort_order: 0 }); loadSubjects(); }
    } else {
      const { error } = await supabase.from('subjects').insert({ name: subjectForm.name.trim(), slug, sort_order: subjectForm.sort_order });
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Ders eklendi.' }); setSubjectForm({ name: '', slug: '', sort_order: 0 }); loadSubjects(); }
    }
  };

  const saveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase || !selectedSubjectId) return;
    const slug = topicForm.slug.trim() || topicForm.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (editingTopic) {
      const { error } = await supabase.from('topics').update({ name: topicForm.name.trim(), slug, sort_order: topicForm.sort_order }).eq('id', editingTopic.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Konu güncellendi.' }); setEditingTopic(null); setTopicForm({ name: '', slug: '', sort_order: 0 }); loadTopics(selectedSubjectId); }
    } else {
      const { error } = await supabase.from('topics').insert({ subject_id: selectedSubjectId, name: topicForm.name.trim(), slug, sort_order: topicForm.sort_order });
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Konu eklendi.' }); setTopicForm({ name: '', slug: '', sort_order: 0 }); loadTopics(selectedSubjectId); }
    }
  };

  const deleteSubject = async (id: string) => {
    if (!supabase || !confirm('Bu dersi ve tüm konularını silmek istediğinize emin misiniz?')) return;
    await supabase.from('subjects').delete().eq('id', id);
    if (selectedSubjectId === id) setSelectedSubjectId(null);
    loadSubjects();
  };

  const deleteTopic = async (id: string) => {
    if (!supabase || !confirm('Bu konuyu silmek istediğinize emin misiniz?')) return;
    await supabase.from('topics').delete().eq('id', id);
    loadTopics(selectedSubjectId);
  };

  return (
    <>
      {message && <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card-bankco">
          <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">Dersler</h2>
          <p className="mb-4 text-sm text-bgray-600 dark:text-bgray-50">Bir derse tıklayın, sağda konuları yönetin.</p>
          {loading ? <p className="text-bgray-600">Yükleniyor…</p> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition hover:shadow-md ${
                    selectedSubjectId === s.id
                      ? 'border-success-300 bg-success-50 dark:bg-success-300/10'
                      : 'border-bgray-200 hover:border-success-300 dark:border-darkblack-400'
                  }`}
                  onClick={() => setSelectedSubjectId(s.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-bgray-900 dark:text-white">{s.name}</h3>
                      <p className="text-xs text-bgray-600 dark:text-bgray-50">Sıra: {s.sort_order}</p>
                    </div>
                    <div className="flex gap-2" onClick={(ev) => ev.stopPropagation()}>
                      <button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => { setEditingSubject(s); setSubjectForm({ name: s.name, slug: s.slug, sort_order: s.sort_order }); }}>Düzenle</button>
                      <button type="button" className="btn-danger !py-1.5 !px-2 text-xs" onClick={() => deleteSubject(s.id)}>Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 border-t border-bgray-200 pt-6 dark:border-darkblack-400">
            <h3 className="mb-3 text-sm font-semibold text-bgray-900 dark:text-white">{editingSubject ? 'Dersi düzenle' : 'Yeni ders'}</h3>
            <form onSubmit={saveSubject} className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Ad</label><input className="input-field" value={subjectForm.name} onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Örn: Tarih" /></div>
              <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Slug</label><input className="input-field" value={subjectForm.slug} onChange={(e) => setSubjectForm((f) => ({ ...f, slug: e.target.value }))} placeholder="otomatik" /></div>
              <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Sıra</label><input className="input-field" type="number" value={subjectForm.sort_order} onChange={(e) => setSubjectForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} /></div>
              <div className="flex gap-2"><button type="submit" className="btn-primary">{editingSubject ? 'Kaydet' : 'Ekle'}</button>{editingSubject && <button type="button" className="btn-secondary" onClick={() => { setEditingSubject(null); setSubjectForm({ name: '', slug: '', sort_order: 0 }); }}>İptal</button>}</div>
            </form>
          </div>
        </div>

        <div className="card-bankco">
          <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">{selectedSubjectId ? (subjects.find((s) => s.id === selectedSubjectId)?.name ?? '') + ' – Konular' : 'Konular'}</h2>
          {!selectedSubjectId ? (
            <p className="text-bgray-600 dark:text-bgray-50">Sol taraftan bir ders seçin.</p>
          ) : (
            <>
              {topicLoading ? <p className="text-bgray-600">Yükleniyor…</p> : (
                <ul className="divide-y divide-bgray-200 dark:divide-darkblack-400">
                  {topics.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-3 first:pt-0">
                      <span className="font-medium text-bgray-900 dark:text-white">{t.name} <span className="text-sm text-bgray-600 dark:text-bgray-50">({t.slug})</span></span>
                      <div className="flex gap-2"><button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => { setEditingTopic(t); setTopicForm({ name: t.name, slug: t.slug, sort_order: t.sort_order }); }}>Düzenle</button><button type="button" className="btn-danger !py-1.5 !px-2 text-xs" onClick={() => deleteTopic(t.id)}>Sil</button></div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 border-t border-bgray-200 pt-6 dark:border-darkblack-400">
                <h3 className="mb-3 text-sm font-semibold text-bgray-900 dark:text-white">{editingTopic ? 'Konuyu düzenle' : 'Yeni konu'}</h3>
                <form onSubmit={saveTopic} className="space-y-4">
                  <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Konu adı</label><input className="input-field" value={topicForm.name} onChange={(e) => setTopicForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Örn: Osmanlı Tarihi" /></div>
                  <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Slug</label><input className="input-field" value={topicForm.slug} onChange={(e) => setTopicForm((f) => ({ ...f, slug: e.target.value }))} placeholder="otomatik" /></div>
                  <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Sıra</label><input className="input-field" type="number" value={topicForm.sort_order} onChange={(e) => setTopicForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} /></div>
                  <div className="flex gap-2"><button type="submit" className="btn-primary">{editingTopic ? 'Kaydet' : 'Ekle'}</button>{editingTopic && <button type="button" className="btn-secondary" onClick={() => { setEditingTopic(null); setTopicForm({ name: '', slug: '', sort_order: 0 }); }}>İptal</button>}</div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
