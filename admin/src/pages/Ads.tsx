import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AdSlot = {
  id: string;
  slug: string;
  name: string;
  ad_type: 'image' | 'admob';
  image_url: string | null;
  link_url: string | null;
  admob_unit_id: string | null;
  is_active: boolean;
  sort_order: number;
  width_px: number | null;
  height_px: number | null;
};

export default function Ads() {
  const [list, setList] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [editing, setEditing] = useState<AdSlot | null>(null);
  const [form, setForm] = useState({
    is_active: true,
    ad_type: 'image' as 'image' | 'admob',
    image_url: '',
    link_url: '',
    admob_unit_id: '',
    width_px: '' as string | number,
    height_px: '' as string | number,
  });

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('ad_slots').select('*').order('sort_order');
    setList((error ? [] : data) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (slot: AdSlot) => {
    setEditing(slot);
    setForm({
      is_active: slot.is_active,
      ad_type: slot.ad_type,
      image_url: slot.image_url ?? '',
      link_url: slot.link_url ?? '',
      admob_unit_id: slot.admob_unit_id ?? '',
      width_px: slot.width_px ?? '',
      height_px: slot.height_px ?? '',
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase || !editing) return;
    const w = form.width_px !== '' && form.width_px !== null ? Number(form.width_px) : null;
    const h = form.height_px !== '' && form.height_px !== null ? Number(form.height_px) : null;
    const payload = {
      is_active: form.is_active,
      ad_type: form.ad_type,
      image_url: form.ad_type === 'image' ? (form.image_url.trim() || null) : null,
      link_url: form.ad_type === 'image' ? (form.link_url.trim() || null) : null,
      admob_unit_id: form.ad_type === 'admob' ? (form.admob_unit_id.trim() || null) : null,
      width_px: w != null && !isNaN(w) ? w : null,
      height_px: h != null && !isNaN(h) ? h : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('ad_slots').update(payload).eq('id', editing.id);
    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Reklam alanı güncellendi.' });
      setEditing(null);
      load();
    }
  };

  const toggleActive = async (slot: AdSlot) => {
    if (!supabase) return;
    const { error } = await supabase.from('ad_slots').update({ is_active: !slot.is_active }).eq('id', slot.id);
    if (!error) load();
  };

  return (
    <>
      {message && <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>}
      <div className="card-bankco mb-6">
        <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">Reklam alanları</h2>
        <p className="mb-4 text-sm text-bgray-600 dark:text-bgray-50">Sitedeki tüm reklam alanlarını buradan yönetin. Her alanı aktif/pasif yapın, boyut (px) verin; kendi reklam görseliniz (resim + link) veya AdMob kullanın.</p>
        {loading ? (
          <p className="text-bgray-600">Yükleniyor…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-bgray-200 dark:border-darkblack-400">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Alan</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Tip</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Boyut</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Durum</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((slot) => (
                  <tr key={slot.id} className="border-b border-bgray-100 dark:border-darkblack-400 hover:bg-bgray-50 dark:hover:bg-darkblack-500">
                    <td className="py-3">
                      <span className="font-medium text-bgray-900 dark:text-white">{slot.name}</span>
                      <span className="ml-2 text-xs text-bgray-500 dark:text-bgray-50">({slot.slug})</span>
                    </td>
                    <td className="py-3 text-sm text-bgray-700 dark:text-bgray-50">{slot.ad_type === 'image' ? 'Kendi resim' : 'AdMob'}</td>
                    <td className="py-3 text-sm text-bgray-700 dark:text-bgray-50">
                      {slot.width_px != null && slot.height_px != null ? `${slot.width_px}×${slot.height_px}` : 'Tam ekran'}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(slot)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.is_active ? 'bg-success-100 text-success-400 dark:bg-success-300/20 dark:text-success-200' : 'bg-bgray-200 text-bgray-600 dark:bg-darkblack-400 dark:text-bgray-50'}`}
                      >
                        {slot.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="py-3">
                      <button type="button" className="btn-secondary !py-1.5 !px-2 text-xs" onClick={() => openEdit(slot)}>Düzenle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="card-bankco">
          <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Düzenle: {editing.name}</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-bgray-700 dark:text-bgray-50">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                Aktif (uygulamada gösterilsin)
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Reklam tipi</label>
              <select
                className="input-field max-w-xs"
                value={form.ad_type}
                onChange={(e) => setForm((f) => ({ ...f, ad_type: e.target.value as 'image' | 'admob' }))}
              >
                <option value="image">Kendi resmim (görsel + link)</option>
                <option value="admob">AdMob reklamı</option>
              </select>
            </div>
            {form.ad_type === 'image' && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Reklam görseli URL</label>
                  <input className="input-field max-w-full" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Tıklanınca açılacak link (opsiyonel)</label>
                  <input className="input-field max-w-full" value={form.link_url} onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
                </div>
              </>
            )}
            {form.ad_type === 'admob' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">AdMob birim kimliği (Banner / Interstitial)</label>
                <input className="input-field max-w-full" value={form.admob_unit_id} onChange={(e) => setForm((f) => ({ ...f, admob_unit_id: e.target.value }))} placeholder="ca-app-pub-xxxxx/yyyyy" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Genişlik (px)</label>
                <input className="input-field w-full" type="number" min="0" value={form.width_px} onChange={(e) => setForm((f) => ({ ...f, width_px: e.target.value }))} placeholder="320 veya boş = tam ekran" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Yükseklik (px)</label>
                <input className="input-field w-full" type="number" min="0" value={form.height_px} onChange={(e) => setForm((f) => ({ ...f, height_px: e.target.value }))} placeholder="50 veya boş" />
              </div>
            </div>
            <p className="text-xs text-bgray-500 dark:text-bgray-50">Boş bırakırsanız reklam tam ekran (örn. kartlar arası) gösterilir. Banner için örn: 320×50.</p>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Kaydet</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>İptal</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
