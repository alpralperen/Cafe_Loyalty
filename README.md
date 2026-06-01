# Kafe Sadakat (Cafe Sadakat)

Dijital kafe sadakat sistemi — Vue 3 PWA arayüzü, Vercel serverless API ve Neon PostgreSQL.

## Özellikler (V1)

- **Müşteri:** Kayıt/giriş, çekirdek ve ücretsiz kahve takibi, QR ile çekirdek kazanma, ücretsiz kahve QR'ı
- **Kasiyer/Admin:** Tek kullanımlık çekirdek QR üretimi, ücretsiz kahve onayı, duyuru yönetimi, günlük istatistik ve anomali uyarıları
- **Güvenlik:** Tek kullanımlık QR, süre sınırı (çekirdek 5 dk, ödül 2 dk), kasiyer audit log

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Vue 3 + Vite + Pinia |
| API | Vercel Serverless (Node.js) |
| Veritabanı | Neon PostgreSQL |
| Barındırma | Vercel |

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Neon veritabanı

1. [neon.tech](https://neon.tech) üzerinde proje oluşturun.
2. `db/schema.sql` dosyasını SQL Editor'de çalıştırın **veya** kurulum API'sini kullanın (aşağıda).

### 3. Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env
```

Vercel'de Project Settings → Environment Variables altına `DATABASE_URL` ve `JWT_SECRET` ekleyin.

### 4. İlk admin (kurulum API ile)

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{"setup_secret":"YOUR_SETUP_SECRET","admin_password":"guclu-sifre"}'
```

`.env` içinde `SETUP_SECRET` tanımlı olmalıdır. Kurulumdan sonra bu endpoint'i üretimde kapatın.

Varsayılan giriş: **admin** / kurulumda belirlediğiniz şifre.

### 5. Geliştirme

Tam yığın (API + frontend):

```bash
npx vercel dev
```

Sadece frontend (API proxy ile, ayrı terminalde `vercel dev` gerekir):

```bash
npm run dev
```

### 6. Vercel'e deploy

```bash
npx vercel
```

`DATABASE_URL`, `JWT_SECRET` ortam değişkenlerini Vercel panelinde tanımlayın.

## İş akışları

1. **Çekirdek kazanma:** Kasiyer kahve adedini girer → QR oluşturur → müşteri `/tara` ile okutur.
2. **Ücretsiz kahve:** Her 10 çekirdek 1 hak verir → müşteri "Kahvemi Kullan" → kasiyer tarar.

## V2 yol haritası

- Google / iCloud OAuth
- Multi-tenant (çoklu şube)
- RBAC (Owner / Manager / Cashier)
- Kampanya görselleri (S3 / Supabase Storage)

## Sunum notları

Kafe sahibine odaklanın: fiziksel kart maliyeti yok, App Store gerekmez, kasiyer işlemi ~3 saniye, tek kullanımlık QR ile suistimal önleme, duyuru paneli ile doğrudan iletişim.
