/**
 * Netlify proxy: Tarayıcı aynı origin'e istek atar, CORS olmaz. Bu fonksiyon Supabase Edge Function'a iletir.
 * Netlify ortam değişkeni: VITE_SUPABASE_URL veya SUPABASE_URL (örn. https://xxx.supabase.co)
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  if (!supabaseUrl) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Supabase URL ayarlanmamış. Netlify\'da VITE_SUPABASE_URL veya SUPABASE_URL tanımlayın.' }),
    };
  }

  const auth = event.headers['authorization'] || event.headers['Authorization'];
  if (!auth) {
    return {
      statusCode: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Yetkisiz' }),
    };
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: event.body || '{}',
    });
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err.message || err) }),
    };
  }
}
