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
4. `npm run login` → otomasyon Chrome'u açılır. Bu pencerede:
   - kullandığınız eklentileri Chrome Web Store'dan kurun (kalıcıdır),
   - EasyCentral ve Amazon'a elle giriş yapın.

Otomasyon Chrome'u normal Chrome olarak açılır (eklentiler çalışır) ve yalnızca bu makineden erişilebilen
bir yerel portla (`CDP_PORT`, varsayılan 9222) programa bağlanır. Profil `profile/` klasöründedir.
Normal günlük Chrome'unuz etkilenmez.

## Modlar
| Komut | Ne yapar |
|---|---|
| `npm run login` | Otomasyon Chrome'unu açar (eklenti kurulumu + elle giriş). |
| `npm run observe` | Hiç tıklamaz. Ctrl+C ile biter, Chrome açık kalır. Mehmet akışı elle yürütür; her sayfa `runs/` altına kaydedilir (+ Jev sınıflandırması). |
| `npm run dryrun` | Akışı yürütür, Place order'dan önce durur. UI haritası onaylanmadan çalışmaz. |
| `npm test` | Güvenlik sınırı testleri. |
