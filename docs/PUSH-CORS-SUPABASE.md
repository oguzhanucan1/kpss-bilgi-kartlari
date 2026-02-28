# Push Bildirim – CORS Hatası (www.kreajans.com)

Admin paneli `https://www.kreajans.com/kpss/` üzerinden Supabase Edge Function `send-push` çağırırken CORS hatası alıyorsanız aşağıdakileri uygulayın.

## 1. Supabase Dashboard’da CORS / İzin verilen origin

1. **Supabase Dashboard** → projenizi seçin.
2. **Project Settings** (sol alttaki dişli) → **API** bölümüne girin.
3. **CORS** veya **Allowed origins** / **Additional allowed origins** gibi bir alan varsa şunu ekleyin:
   - `https://www.kreajans.com`
   - İsterseniz: `https://kreajans.com`
4. Kaydedin.

(Bazı Supabase sürümlerinde bu ayar **Edge Functions** altında veya **Authentication → URL Configuration** içinde de olabilir; arayüzü kontrol edin.)

## 2. send-push fonksiyonunu yeniden deploy edin

CORS cevabı (OPTIONS 200) güncellendi. Deploy:

```bash
cd proje-koku
npx supabase functions deploy send-push
```

Veya Supabase Dashboard → **Edge Functions** → **send-push** → **Redeploy**.

## 3. Admin panelini yeniden build edip yükleyin

`admin` içinde `apikey` header eklendi. Build ve yükleme:

```bash
cd admin
npm run build:kpss
```

Ardından `dist` içeriğini **public_html/kpss** altına tekrar yükleyin.

## Hâlâ CORS alıyorsanız

- Tarayıcıda **F12** → **Network** sekmesinde **send-push** isteğine tıklayın; **Headers** kısmında **Response Headers** içinde `Access-Control-Allow-Origin` var mı bakın.
- Supabase **Edge Functions** → **send-push** → **Logs** kısmında OPTIONS isteği geliyor mu kontrol edin. OPTIONS hiç gelmiyorsa engelleme Supabase ağ geçidi tarafındadır; Dashboard’daki CORS/origin ayarını mutlaka ekleyin.
