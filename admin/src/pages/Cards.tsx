import { useEffect, useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { RichTextEditor } from '../components/RichTextEditor';

type BulkRow = { content: string; title?: string; sort_order: number };

type Subject = { id: string; name: string };
type Topic = { id: string; name: string; subject_id: string };
type Card = { id: string; topic_id: string; title: string | null; content: string; sort_order: number };

const CARD_IMAGES_BUCKET = 'card-images';

const EXAMPLE_HEADERS = ['içerik', 'başlık', 'sıra'];

function downloadExampleExcel() {
  const wsData = [
    EXAMPLE_HEADERS,
    ['Osmanlı Devleti 1299\'da kuruldu.', 'Kuruluş', 1],
    ['İstanbul 1453\'te fethedildi.', 'Fetih', 2],
    ['Üçüncü örnek kart metni.', '', 3],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kartlar');
  XLSX.writeFile(wb, 'kart-ornek.xlsx');
}

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
  const [form, setForm] = useState({ title: '', content: '', sort_order: 0 });
  const [bulkPreview, setBulkPreview] = useState<BulkRow[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    if (!supabase) throw new Error('Supabase bağlantısı yok.');
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { error } = await supabase.storage.from(CARD_IMAGES_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(CARD_IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

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
      content: form.content.trim() || '',
      sort_order: form.sort_order,
    };
    if (editing) {
      const { error } = await supabase.from('flash_cards').update(payload).eq('id', editing.id);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Kart güncellendi.' }); setEditing(null); setForm({ title: '', content: '', sort_order: 0 }); loadCards(selectedTopicId); }
    } else {
      const { error } = await supabase.from('flash_cards').insert(payload);
      if (error) setMessage({ type: 'error', text: error.message });
      else { setMessage({ type: 'success', text: 'Kart eklendi.' }); setForm({ title: '', content: '', sort_order: 0 }); loadCards(selectedTopicId); }
    }
  };

  const del = async (id: string) => {
    if (!supabase || !confirm('Bu kartı silmek istediğinize emin misiniz?')) return;
    await supabase.from('flash_cards').delete().eq('id', id);
    loadCards(selectedTopicId);
  };

  const normalizeHeader = (h: string) => String(h ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const findCol = (row: Record<string, unknown>, keys: string[]) => {
    const lower = Object.keys(row).map((k) => normalizeHeader(k));
    for (const key of keys) {
      const n = normalizeHeader(key);
      const i = lower.findIndex((l) => l === n || l.includes(n) || n.includes(l));
      if (i >= 0) return row[Object.keys(row)[i]] as string;
    }
    return '';
  };

  const parseBulkFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        let rows: BulkRow[] = [];
        if (ext === 'csv' || !raw) {
          const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw as ArrayBuffer);
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          const sep = text.includes(';') ? ';' : ',';
          const header = lines[0].split(sep).map((c) => c.trim());
          const contentIdx = header.findIndex((h) => /içerik|content|metin|text/i.test(normalizeHeader(h)));
          const titleIdx = header.findIndex((h) => /başlık|title/i.test(normalizeHeader(h)));
          const sortIdx = header.findIndex((h) => /sıra|sort/i.test(normalizeHeader(h)));
          for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(sep);
            const content = contentIdx >= 0 ? cells[contentIdx]?.trim() ?? '' : cells[0] ?? '';
            if (!content) continue;
            rows.push({
              content,
              title: titleIdx >= 0 ? cells[titleIdx]?.trim() : undefined,
              sort_order: sortIdx >= 0 ? Number(cells[sortIdx]) || i : i,
            });
          }
        } else {
          const wb = XLSX.read(raw, { type: 'array' });
          const first = wb.SheetNames[0];
          const sheet = wb.Sheets[first];
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
          rows = json.map((row, i) => ({
            content: String(findCol(row, ['içerik', 'content', 'metin', 'text']) || ''),
            title: (findCol(row, ['başlık', 'title']) as string) || undefined,
            sort_order: Number(findCol(row, ['sıra', 'sort_order']) || i + 1),
          })).filter((r) => r.content.trim());
        }
        setBulkPreview(rows);
        setMessage(rows.length ? { type: 'success', text: `${rows.length} kart bulundu. İçe aktarmak için aşağıdaki butonu kullanın.` } : { type: 'error', text: 'Uygun satır bulunamadı. Sütun: içerik (zorunlu), isteğe bağlı başlık, sıra. Örnek dosyayı indirip formatı inceleyin.' });
      } catch (err) {
        setMessage({ type: 'error', text: 'Dosya okunamadı. Excel (.xlsx) veya CSV kullanın. İlk satır başlık olmalı.' });
        setBulkPreview([]);
      }
    };
    if (ext === 'csv') reader.readAsText(file, 'UTF-8');
    else reader.readAsArrayBuffer(file);
  };

  const importBulk = async () => {
    if (!supabase || !selectedTopicId || bulkPreview.length === 0) return;
    setBulkLoading(true);
    setMessage(null);
    const rows = bulkPreview.map((r) => ({
      topic_id: selectedTopicId,
      title: r.title?.trim() || null,
      content: String(r.content).trim() || '',
      sort_order: r.sort_order,
    }));
    const { error } = await supabase.from('flash_cards').insert(rows);
    setBulkLoading(false);
    if (error) setMessage({ type: 'error', text: error.message });
    else { setMessage({ type: 'success', text: `${rows.length} kart eklendi.` }); setBulkPreview([]); loadCards(selectedTopicId); }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              <div>
                <span className="mb-1 block text-sm font-semibold text-bgray-700 dark:text-bgray-50">Kart içeriği</span>
                <p className="mb-1 text-xs text-bgray-500 dark:text-bgray-50">Renk, kalınlık, resim ve liste kullanabilirsiniz. Türkçe karakterler desteklenir. Boşluklar ve satır sonları uygulamada korunur.</p>
                <div className="max-w-3xl">
                  <RichTextEditor
                    key={editing?.id ?? 'new'}
                    value={form.content}
                    onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                    placeholder="Kart metni... (Türkçe: ğüşıöç ĞÜŞİÖÇ)"
                    height={260}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Sıra</label><input className="input-field w-28" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} /></div>
              <div className="flex gap-2"><button type="submit" className="btn-primary">{editing ? 'Kaydet' : 'Ekle'}</button>{editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ title: '', content: '', sort_order: 0 }); }}>İptal</button>}</div>
            </form>
          </div>

          <div className="card-bankco mb-6">
            <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">Toplu kart ekle (Excel / CSV)</h2>
            <p className="mb-3 text-sm text-bgray-600 dark:text-bgray-50">İlk satır başlık olmalı. Zorunlu sütun: <strong>içerik</strong>. İsteğe bağlı: başlık, sıra. Aynı formatta dosya hazırlamak için örnek Excel dosyasını indirin.</p>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-secondary" onClick={downloadExampleExcel}>Örnek dosyayı indir (.xlsx)</button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="block max-w-sm text-sm text-bgray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-success-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-success-400" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseBulkFile(f); }} />
            </div>
            {bulkPreview.length > 0 && (
              <>
                <div className="mb-4 max-h-60 overflow-auto rounded-xl border border-bgray-200 dark:border-darkblack-400">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="sticky top-0 border-b border-bgray-200 bg-bgray-50 dark:border-darkblack-400 dark:bg-darkblack-500"><th className="px-3 py-2 text-left text-xs font-semibold text-bgray-600 dark:text-bgray-50">İçerik</th><th className="px-3 py-2 text-left text-xs font-semibold text-bgray-600 dark:text-bgray-50">Sıra</th></tr></thead>
                    <tbody>{bulkPreview.slice(0, 20).map((r, i) => (<tr key={i} className="border-b border-bgray-100 dark:border-darkblack-400"><td className="max-w-[320px] truncate px-3 py-2 text-bgray-700 dark:text-bgray-50">{String(r.content).replace(/<[^>]*>/g, ' ').slice(0, 70)}</td><td className="px-3 py-2">{r.sort_order}</td></tr>))}</tbody>
                  </table>
                </div>
                {bulkPreview.length > 20 && <p className="mb-2 text-xs text-bgray-600 dark:text-bgray-50">… ve {bulkPreview.length - 20} satır daha</p>}
                <button type="button" className="btn-primary" disabled={bulkLoading} onClick={importBulk}>{bulkLoading ? 'Ekleniyor…' : `${bulkPreview.length} kartı içe aktar`}</button>
              </>
            )}
          </div>

          <div className="card-bankco">
            <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Bu konudaki kartlar</h2>
            {cardLoading ? <p className="text-bgray-600">Yükleniyor…</p> : (
              <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-bgray-200 dark:border-darkblack-400"><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">İçerik (özet)</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Sıra</th><th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50"></th></tr></thead><tbody>{cards.map((c) => (<tr key={c.id} className="border-b border-bgray-100 dark:border-darkblack-400 hover:bg-bgray-50 dark:hover:bg-darkblack-500"><td className="max-w-[400px] py-3 text-sm text-bgray-700 dark:text-bgray-50">{String(c.content || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 100)}{(c.content || '').length > 100 ? '…' : ''}</td><td className="py-3 text-sm">{c.sort_order}</td><td className="py-3"><div className="flex gap-2"><button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => { setEditing(c); setForm({ title: c.title ?? '', content: c.content ?? '', sort_order: c.sort_order }); }}>Düzenle</button><button type="button" className="btn-danger !py-1.5 !px-2 text-xs" onClick={() => del(c.id)}>Sil</button></div></td></tr>))}</tbody></table></div>
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
