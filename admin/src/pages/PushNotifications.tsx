import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type PushLog = {
  id: string;
  title: string;
  body: string | null;
  sent_at: string;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  created_at: string;
};

export default function PushNotifications() {
  const [fcmJson, setFcmJson] = useState('');
  const [fcmSaved, setFcmSaved] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from('app_settings').select('value').eq('key', 'fcm_service_account').single();
      setFcmSaved(!!data?.value);
    })();
  }, []);

  const loadLogs = async () => {
    if (!supabase) return;
    setLogsLoading(true);
    const { data } = await supabase.from('push_logs').select('*').order('sent_at', { ascending: false }).limit(50);
    setLogs((data ?? []) as PushLog[]);
    setLogsLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const saveFcm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    const json = fcmJson.trim();
    if (!json) {
      setMessage({ type: 'error', text: 'JSON yapıştırın veya boş bırakıp kaydetmeyin.' });
      return;
    }
    try {
      JSON.parse(json);
    } catch {
      setMessage({ type: 'error', text: 'Geçerli bir JSON değil.' });
      return;
    }
    const { error } = await supabase.from('app_settings').upsert(
      { key: 'fcm_service_account', value: json, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Firebase ayarları kaydedildi.' });
      setFcmSaved(true);
      setFcmJson('');
    }
  };

  const sendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return;
    setSending(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        const msg = userError?.message ?? '';
        if (msg.includes('refresh') || msg.includes('token') || msg.includes('session') || userError?.status === 400) {
          throw new Error('Oturum sona erdi. Lütfen çıkış yapıp tekrar giriş yapın.');
        }
        throw new Error('Oturum bulunamadı. Giriş yapın.');
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Oturum bulunamadı.');

      const pushApiUrl = import.meta.env.VITE_PUSH_API_URL?.trim() || '/.netlify/functions/send-push';
      const res = await fetch(pushApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ title: title.trim() || 'Bildirim', body: body.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Bildirim API bulunamadı (404). Netlify\'da deploy edin veya .env\'e VITE_PUSH_API_URL=https://PROJE_REF.supabase.co/functions/v1/send-push ekleyin.');
        }
        if (res.status === 401 || (data as { error?: string }).error?.toLowerCase().includes('oturum')) {
          throw new Error('Oturum sona erdi. Lütfen çıkış yapıp tekrar giriş yapın.');
        }
        throw new Error((data as { error?: string }).error || res.statusText || 'Gönderilemedi.');
      }
      const err = (data as { error?: string }).error;
      if (err) throw new Error(err);
      const sent = (data as { sent?: number }).sent ?? 0;
      const total = (data as { total?: number }).total ?? 0;
      setMessage({ type: 'success', text: `${sent} cihaza bildirim gönderildi${total ? ` / ${total} hedef` : ''}.` });
      setTitle('');
      setBody('');
      loadLogs();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isAuthError = /refresh|token|session|invalid|not found/i.test(msg) || (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 400);
      setMessage({ type: 'error', text: isAuthError ? 'Oturum sona erdi. Lütfen çıkış yapıp tekrar giriş yapın.' : msg });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {message && (
        <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>
      )}

      <div className="card-bankco mb-6">
        <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">Firebase (FCM) ayarları</h2>
        <p className="mb-4 text-sm text-bgray-600 dark:text-bgray-50">
          Firebase Console → Proje ayarları → Service hesaplar → Yeni özel anahtar oluştur. İndirdiğiniz JSON dosyasının içeriğini aşağıya yapıştırın. FCM HTTP v1 ile bildirim gönderilir.
        </p>
        {fcmSaved && <p className="mb-2 text-sm text-success-600 dark:text-success-400">Firebase ayarları kayıtlı.</p>}
        <form onSubmit={saveFcm} className="space-y-4">
          <textarea
            className="input-field max-w-full font-mono text-sm min-h-[120px]"
            value={fcmJson}
            onChange={(e) => setFcmJson(e.target.value)}
            placeholder='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...","client_email":"...",...}'
            rows={6}
          />
          <button type="submit" className="btn-primary">Kaydet</button>
        </form>
      </div>

      <div className="card-bankco mb-6">
        <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">Push bildirim gönder</h2>
        <p className="mb-4 text-sm text-bgray-600 dark:text-bgray-50">
          Kayıtlı tüm cihazlara (FCM token’ı olan kullanıcılar) bildirim gider.
        </p>
        <form onSubmit={sendPush} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Başlık</label>
            <input className="input-field max-w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Mesaj</label>
            <textarea className="input-field max-w-full min-h-[80px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Bildirim metni" rows={3} />
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>{sending ? 'Gönderiliyor…' : 'Gönder'}</button>
        </form>
      </div>

      <div className="card-bankco">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Gönderim istatistikleri</h2>
        {logsLoading ? (
          <p className="text-bgray-600">Yükleniyor…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-bgray-200 dark:border-darkblack-400">
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-bgray-600 dark:text-bgray-50">Tarih</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-bgray-600 dark:text-bgray-50">Başlık</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-bgray-600 dark:text-bgray-50">Hedef</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-bgray-600 dark:text-bgray-50">Başarılı</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-bgray-600 dark:text-bgray-50">Başarısız</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-sm text-bgray-500">Henüz gönderim yok.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-bgray-100 dark:border-darkblack-400">
                      <td className="py-3 text-sm text-bgray-700 dark:text-bgray-50">
                        {new Date(log.sent_at).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 text-sm font-medium text-bgray-900 dark:text-white">{log.title}</td>
                      <td className="py-3 text-sm">{log.total_recipients}</td>
                      <td className="py-3 text-sm text-success-600">{log.success_count}</td>
                      <td className="py-3 text-sm text-red-600">{log.failed_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
