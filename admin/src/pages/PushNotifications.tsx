import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { RichTextEditor } from '../components/RichTextEditor';

export default function PushNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const sendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase yapılandırılmamış.' });
      return;
    }
    setSending(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        throw new Error('Oturum bulunamadı. Çıkış yapıp tekrar giriş yapın.');
      }
      let token = session.access_token;
      const { data: { session: refreshed } } = await supabase.auth.refreshSession();
      if (refreshed?.access_token) token = refreshed.access_token;
      if (!token) throw new Error('Oturum geçersiz. Çıkış yapıp tekrar giriş yapın.');

      const proxyUrl = (import.meta.env.VITE_PUSH_PROXY_URL?.trim() ?? '').replace(/\/+$/, '');
      const plainBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const payload = {
        title: title.trim() || 'Bildirim',
        body: plainBody,
        access_token: token,
      };

      if (proxyUrl) {
        const res = await fetch(proxyUrl, {
          method: 'POST',
          redirect: 'manual',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': token,
          },
          body: JSON.stringify(payload),
        });
        if (res.type === 'opaqueredirect' || res.status === 301 || res.status === 302) {
          const loc = res.headers.get('Location');
          const finalUrl = loc ? (loc.startsWith('http') ? loc : new URL(loc, proxyUrl).href) : proxyUrl;
          const res2 = await fetch(finalUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Access-Token': token }, body: JSON.stringify(payload) });
          const data2 = await res2.json().catch(() => ({}));
          if (!res2.ok) throw new Error((data2 as { error?: string })?.error ?? res2.statusText);
          const sent = (data2 as { sent?: number })?.sent ?? 0;
          setMessage({ type: 'success', text: `OneSignal ile ${sent} aboneye bildirim gönderildi.` });
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string })?.error ?? res.statusText);
        const sent = (data as { sent?: number })?.sent ?? 0;
        setMessage({ type: 'success', text: `OneSignal ile ${sent} aboneye bildirim gönderildi.` });
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-onesignal-push', {
        body: { title: title.trim() || 'Bildirim', body: plainBody, access_token: token },
        headers: { Authorization: `Bearer ${token}` },
      });
      const errMsg = (data as { error?: string })?.error;
      if (error) throw new Error(errMsg || error.message || 'Gönderilemedi.');
      if (errMsg) throw new Error(errMsg);
      const sent = (data as { sent?: number })?.sent ?? 0;
      setMessage({ type: 'success', text: `OneSignal ile ${sent} aboneye bildirim gönderildi.` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gönderilemedi.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-bgray-900 dark:text-white">Push Bildirim (OneSignal)</h1>
      {message && (
        <div className={`mb-6 ${message.type === 'error' ? 'msg-error' : 'msg-success'}`}>{message.text}</div>
      )}
      <div className="card-bankco mb-6 max-w-xl">
        <h2 className="mb-2 text-lg font-semibold text-bgray-900 dark:text-white">Bildirim gönder</h2>
        <p className="mb-4 text-sm text-bgray-600 dark:text-bgray-50">
          OneSignal abonelerine (uygulamayı açıp bildirime izin veren kullanıcılar) push gönderilir.
        </p>
        <form onSubmit={sendPush} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Başlık</label>
            <input
              className="input-field max-w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Mesaj</label>
            <RichTextEditor value={body} onChange={setBody} placeholder="Bildirim metni" height={120} />
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? 'Gönderiliyor…' : 'Gönder'}
          </button>
        </form>
      </div>
      <div className="text-sm text-bgray-600 dark:text-bgray-50">
        <p className="font-medium">Kurulum:</p>
        <ul className="mt-1 list-inside list-disc">
          <li>OneSignal Dashboard → Settings → Keys &amp; IDs → <strong>REST API Key</strong> (veya API Key) kopyalayın; Supabase secret’ta <code>Key &lt;anahtar&gt;</code> biçiminde değil, sadece anahtar değerini yapıştırın.</li>
          <li>Supabase Dashboard → Project Settings → Edge Functions → send-onesignal-push → Secrets: <code className="rounded bg-bgray-200 px-1 dark:bg-darkblack-400">ONESIGNAL_REST_API_KEY</code> ekleyin.</li>
          <li>Paylaşımlı hostingte CORS için <code className="rounded bg-bgray-200 px-1 dark:bg-darkblack-400">VITE_PUSH_PROXY_URL</code> ile PHP proxy kullanabilirsiniz.</li>
        </ul>
      </div>
    </>
  );
}
