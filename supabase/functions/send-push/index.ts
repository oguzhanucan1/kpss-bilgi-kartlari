// FCM HTTP v1 ile push bildirim gönderir. Admin panelinden çağrılır. İstatistik push_logs'a yazılır.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.2.0/index.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

async function getFcmAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new jose.SignJWT({ scope: 'https://www.googleapis.com/auth/firebase.messaging' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(sa.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(await jose.importPKCS8(sa.private_key, 'RS256'));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error('FCM token alınamadı: ' + await res.text());
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Oturum gerekli' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return new Response(JSON.stringify({ error: 'Sadece admin bildirim gönderebilir' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.body === 'string' ? body.body.trim() : (body.message ?? '');
    if (!title && !message) return new Response(JSON.stringify({ error: 'title veya body gerekli' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: settingsRow } = await supabase.from('app_settings').select('value').eq('key', 'fcm_service_account').single();
    const serviceAccountJson = settingsRow?.value;

    const { data: tokens, error: tokensError } = await supabase.from('push_tokens').select('token, token_type');
    if (tokensError) return new Response(JSON.stringify({ error: 'Token listesi alınamadı' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const all = (tokens ?? []) as { token: string; token_type: string }[];
    const fcmTokens = all.filter((r) => r.token_type === 'fcm').map((r) => r.token).filter(Boolean);
    const expoTokens = all.filter((r) => r.token_type === 'expo').map((r) => r.token).filter(Boolean);
    const totalRecipients = fcmTokens.length + expoTokens.length;

    if (totalRecipients === 0) {
      await supabase.from('push_logs').insert({ title: title || 'Bildirim', body: message, total_recipients: 0, success_count: 0, failed_count: 0 });
      return new Response(JSON.stringify({ sent: 0, total: 0, message: 'Kayıtlı cihaz yok' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let successCount = 0;
    let failedCount = 0;

    if (fcmTokens.length > 0) {
      if (!serviceAccountJson) return new Response(JSON.stringify({ error: 'FCM ayarları yapılmamış. Admin panelinden Firebase service account ekleyin.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const sa = JSON.parse(serviceAccountJson);
      const projectId = sa.project_id;
      const accessToken = await getFcmAccessToken(serviceAccountJson);
      const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
      for (const token of fcmTokens) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify({
            message: {
              token,
              notification: { title: title || 'Bildirim', body: message || title },
              android: { priority: 'high' },
            },
          }),
        });
        if (res.ok) successCount++; else failedCount++;
      }
    }

    if (expoTokens.length > 0) {
      const expoMessages = expoTokens.map((to) => ({ to, title: title || 'Bildirim', body: message || title, sound: 'default' }));
      for (let i = 0; i < expoMessages.length; i += 100) {
        const chunk = expoMessages.slice(i, i + 100);
        const res = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(chunk),
        });
        if (res.ok) successCount += chunk.length; else failedCount += chunk.length;
      }
    }

    await supabase.from('push_logs').insert({
      title: title || 'Bildirim',
      body: message,
      total_recipients: totalRecipients,
      success_count: successCount,
      failed_count: failedCount,
    });

    return new Response(JSON.stringify({ sent: successCount, failed: failedCount, total: totalRecipients }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
