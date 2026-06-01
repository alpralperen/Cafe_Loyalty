# Hızlı kurulum (Windows)

## `backend doesn't exist` hatası

Vercel panelinde proje yanlışlıkla **Root Directory: backend** olarak ayarlanmıştı. Bu depo kökünde `api/` kullanır; `backend/` klasörü yoktur. Ayar düzeltildi (kök dizin + Vite).

`vercel pull` komutu `.vercel/project.json` dosyasını yeniden indirirse `rootDirectory` tekrar `backend` görünüyorsa Vercel → Project Settings → Root Directory alanını **boş** bırakın.

## Yerel çalıştırma

```powershell
cd C:\Users\alpra\cafe-sadakat
npm install
vercel dev
```

Tarayıcı: http://localhost:3000

API test: http://localhost:3000/api/health → `{"ok":true,...}`

## Veritabanı + admin (bir kez)

`.env` dosyanızda `DATABASE_URL` ve `JWT_SECRET` tanımlı olmalı.

```powershell
npm run setup:db -- "GucluAdminSifreniz"
```

Varsayılan kasiyer: **admin** / verdiğiniz şifre.

Alternatif (API ile):

```powershell
$body = @{ setup_secret = "SETUP_SECRET değeriniz"; admin_password = "GucluAdminSifreniz" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/setup" -Method POST -ContentType "application/json" -Body $body
```

## Vercel ortam değişkenleri

Vercel → **cafe-sadakat** → Settings → Environment Variables:

| Değişken | Production | Preview | Development |
|----------|------------|---------|-------------|
| DATABASE_URL | ✓ | ✓ | ✓ |
| JWT_SECRET | ✓ | ✓ | ✓ |
| SETUP_SECRET | ✓ (kurulum sonrası silin) | — | — |

`.env` içeriğini panelden ekleyebilir veya:

```powershell
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

Her soruda değeri yapıştırın; Production + Preview + Development işaretleyin.

## Vercel Hobby: 12 function limiti

Her `api/*.js` dosyası ayrı bir Serverless Function sayılır (limit: 12). Bu proje tüm API'yi **tek** dosyada toplar: `api/[[...path]].js`. URL'ler değişmez (`/api/health`, `/api/auth/login`, …).

## Canlı deploy

```powershell
vercel --prod
```

Canlı URL: https://cafe-sadakat.vercel.app
