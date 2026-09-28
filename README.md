# mehmet-order-agent

EasyCentral → Amazon sipariş akışı ajanı. Mağazanın **Windows VM'i içinde** çalışır.
Karar verici: TypeSafe **Jev** (tipli karar + güven). Tıklamayı deterministik kod yapar.
Operasyon kuralları: `mehmet-macun-brain` → `brain/workflows/v1-browser-order-automation.md`.

## Güvenlik sınırları (kodda)
- `place_order` kilitli (`config.allowPlaceOrder = false`). Dry run Place order'dan önce durur.
- Jev güveni `MIN_CONFIDENCE` altında → dur.
- Giriş / captcha / hata / bilinmeyen sayfa → dur.
- Kâr/zarar kodla hesaplanır; zarar → Mehmet'e bırakılır.
- Yalnızca onaylı seçicili eylemler çalışır (`src/actions.ts`).
- Şifre yok: Mehmet otomasyon profilinde elle giriş yapar. `.env`, `profile/`, `runs/` Git'e girmez.

## VM kurulumu (store-01, Chrome)
1. Node.js 20+ kur (nodejs.org, LTS).
2. Repoyu klonla, klasörde: `npm install`
3. `.env.example` → `.env` kopyala; `EC_URL`, `TYPESAFE_API_KEY` doldur.
4. `npm run login` → açılan Chrome'da EasyCentral + Amazon'a elle giriş yap, pencereyi kapat.

## Modlar
| Komut | Ne yapar |
|---|---|
| `npm run observe` | Hiç tıklamaz. Mehmet akışı elle yürütür; her sayfa `runs/` altına kaydedilir (+ Jev sınıflandırması). |
| `npm run dryrun` | Akışı yürütür, Place order'dan önce durur. UI haritası onaylanmadan çalışmaz. |
| `npm test` | Güvenlik sınırı testleri. |
