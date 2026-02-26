/**
 * Push bildirim sunucusu – Firebase Admin (FCM) + Expo Push API.
 * Admin panelinden Authorization: Bearer <supabase_jwt> ile çağrılır.
 */
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Firebase Admin – service account: server/serviceAccountKey.json veya GOOGLE_APPLICATION_CREDENTIALS
const path = require('path');
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'serviceAccountKey.json');
let admin = null;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    } else {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }
} catch (e) {
  console.warn('Firebase Admin başlatılamadı (FCM devre dışı). serviceAccountKey.json veya GOOGLE_APPLICATION_CREDENTIALS gerekli.', e.message);
}

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env içinde tanımlı olmalı.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/** JWT ile kullanıcıyı doğrula ve admin rolünü kontrol et */
async function requireAdmin(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

/** FCM ile tek mesaj gönder */
async function sendFcm(token, title, body) {
  if (!admin?.messaging()) return false;
  try {
    await admin.messaging().send({
      token,
      notification: { title: title || 'Bildirim', body: body || title },
      android: { priority: 'high' },
    });
    return true;
  } catch {
    return false;
  }
}

/** Expo Push API ile chunk gönder */
async function sendExpoChunk(messages) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  return res.ok;
}

app.options('/api/send-push', (_, res) => {
  res.set('Access-Control-Allow-Origin', '*').set('Access-Control-Allow-Methods', 'POST, OPTIONS').set('Access-Control-Allow-Headers', 'authorization, content-type').sendStatus(204);
});

app.post('/api/send-push', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const authHeader = req.headers.authorization;
  const user = await requireAdmin(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Yetkisiz. Admin oturumu gerekli.' });
  }

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body.body === 'string' ? req.body.body.trim() : (req.body.message ?? '');
  const finalTitle = title || 'Bildirim';
  const finalBody = message || finalTitle;

  let successCount = 0;
  let failedCount = 0;

  const { data: tokens, error: tokensError } = await supabaseAdmin.from('push_tokens').select('token, token_type');
  if (tokensError) {
    return res.status(500).json({ error: 'Token listesi alınamadı' });
  }
  const all = tokens ?? [];
  const fcmTokens = all.filter((r) => r.token_type === 'fcm').map((r) => r.token).filter(Boolean);
  const expoTokens = all.filter((r) => r.token_type === 'expo').map((r) => r.token).filter(Boolean);
  const totalRecipients = fcmTokens.length + expoTokens.length;

  if (totalRecipients === 0) {
    await supabaseAdmin.from('push_logs').insert({
      title: finalTitle,
      body: finalBody,
      total_recipients: 0,
      success_count: 0,
      failed_count: 0,
    });
    return res.json({ sent: 0, total: 0, message: 'Kayıtlı cihaz yok' });
  }

  for (const token of fcmTokens) {
    const ok = await sendFcm(token, finalTitle, finalBody);
    if (ok) successCount++; else failedCount++;
  }

  for (let i = 0; i < expoTokens.length; i += 100) {
    const chunk = expoTokens.slice(i, i + 100).map((to) => ({ to, title: finalTitle, body: finalBody, sound: 'default' }));
    const ok = await sendExpoChunk(chunk);
    if (ok) successCount += chunk.length; else failedCount += chunk.length;
  }

  await supabaseAdmin.from('push_logs').insert({
    title: finalTitle,
    body: finalBody,
    total_recipients: totalRecipients,
    success_count: successCount,
    failed_count: failedCount,
  });

  res.json({ sent: successCount, failed: failedCount, total: totalRecipients });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Push server http://localhost:${PORT} (FCM: ${admin?.messaging() ? 'açık' : 'kapalı'})`);
});
