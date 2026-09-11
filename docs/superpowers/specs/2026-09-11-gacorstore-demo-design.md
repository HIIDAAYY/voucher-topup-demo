# GacorStore — Demo Top-Up Voucher Game (Tahap 1) — Design Spec

Tanggal: 2026-09-11

## Konteks & Tujuan

Demo web top-up voucher game bergaya DrianStore (drianstore.com/id-id), dipakai owner sebagai
"bahasa pertama" untuk membuka pembicaraan harga & scope dengan klien, sekaligus bukti bahwa
alur top-up (bukan cuma tampilan) sudah dipahami.

Ini demo **Tahap 1**: mock penuh, tanpa payment gateway sungguhan dan tanpa API provider H2H
(Digiflazz atau sejenis) sungguhan. Integrasi sungguhan dibahas belakangan di project terpisah
dengan budget berbeda.

Brand demo: **GacorStore** (nama fiktif — bukan replikasi nama/brand DrianStore, untuk
menghindari isu merek karena demo ini akan di-deploy publik).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Tanpa database sungguhan: data game & harga statis di `data/seed.ts`; transaksi di React
  Context + `localStorage` (situs nyata di-deploy Vercel, bukan halaman sekali-lihat — localStorage
  cukup untuk "Cek Transaksi" tanpa DB sungguhan)
- Tanpa autentikasi sungguhan, tanpa payment gateway sungguhan, tanpa API provider sungguhan
- Deploy ke Vercel

## Struktur folder

```
app/
  layout.tsx            # header, footer + badge "DEMO — simulasi", provider context
  page.tsx               # homepage
  produk/[game]/page.tsx # halaman produk (2 langkah + sidebar)
  checkout/[orderId]/page.tsx # pilih metode bayar -> instruksi bayar -> simulasi
  cek-transaksi/page.tsx
components/
  Header, Footer, DemoBadge
  Homepage: HeroBanner, SearchBar, GameGrid, GameCard, CategoryTabs
  Produk: AccountForm, PriceGroup, PriceCard, ProductSidebar, Toast
  Checkout: PaymentMethodPicker, PaymentInstructions, OrderStatusBadge
  CekTransaksi: TransactionSearchForm, TransactionDetail
context/
  TransactionContext.tsx  # createOrder, getOrderByCode, simulatePaymentSuccess, seed awal
data/
  seed.ts                 # games, price groups/variants, 3 transaksi contoh
lib/
  types.ts                # Game, PriceVariant, Order, OrderStatus
  format.ts                # formatRupiah, generateOrderCode
```

## Data model (`lib/types.ts`)

```ts
type Game = {
  slug: string
  name: string
  icon: string          // nama ikon generik (lucide), bukan logo resmi
  requiresServer: boolean
  rating: number
  ratingCount: number
  hasFullCatalog: boolean // true untuk Mobile Legends & Free Fire
}

type PriceVariant = {
  id: string
  gameSlug: string
  group: 'Special Items' | 'Top Up Instan'
  name: string
  price: number
}

type OrderStatus = 'Menunggu Pembayaran' | 'Diproses' | 'Berhasil'

type Order = {
  code: string
  gameSlug: string
  gameName: string
  accountId: string
  server?: string
  item: { name: string; price: number }
  paymentMethod?: 'QRIS' | 'Virtual Account'
  status: OrderStatus
  createdAt: string
}
```

## Data contoh

- **Mobile Legends** (requiresServer: true) dan **Free Fire** (requiresServer: false): masing-masing
  6–8 varian harga, dikelompokkan Special Items (item premium/pass) dan Top Up Instan (nominal
  reguler kecil→besar, naik wajar).
- **PUBG Mobile** dan **Valorant** tampil di grid homepage (ikon generik) tapi `hasFullCatalog: false`
  — halaman produknya menampilkan state "Produk belum tersedia di demo ini" (200, bukan 404/crash).
- 3 transaksi contoh dengan status berbeda (Menunggu Pembayaran, Diproses, Berhasil), di-seed ke
  `localStorage` sekali saat context pertama kali init (kalau key belum ada).

## Alur halaman

### `/` — Homepage
Hero "TOP UP ALL GAME — MURAH, CEPAT DAN TERPERCAYA", search bar "Cari Game atau Voucher" (filter
client-side sederhana atas nama game), grid 4 game, tab kategori: Top Up Game (aktif) / Live
Streaming / Voucher / Joki (3 terakhir disabled, label "Segera", tidak menuju halaman kosong).

### `/produk/[game]` — Halaman Produk
- **Step 1 — Masukkan Data Akun**: input ID (+ Server untuk game `requiresServer`, pakai dropdown
  nomor server contoh).
- **Step 2 — Pilih Nominal**: `PriceGroup` per kategori, tiap kartu `PriceCard` selalu clickable
  (bukan HTML disabled) — `onClick` mengecek validitas Step 1; kalau belum lengkap, tampilkan
  toast custom "Silahkan isi data akun terlebih dahulu." dan **tidak** menyimpan seleksi.
- Sidebar kanan: rating ("5.00 dari N rating"), kotak "Butuh Bantuan?", ringkasan item terpilih,
  tombol "Pesan Sekarang!" — disabled selama data akun atau nominal belum lengkap; saat aktif,
  klik membuat `Order` baru (status `Menunggu Pembayaran`) lalu redirect ke `/checkout/[orderId]`.
- Untuk game `hasFullCatalog: false`: render state kosong yang jelas, bukan form.

### `/checkout/[orderId]`
Baca order dari context by id/code.
1. Belum ada `paymentMethod` → tampilkan `PaymentMethodPicker` (QRIS / Virtual Account, mock).
   Memilih salah satu men-update order (`paymentMethod` terisi), tetap di halaman yang sama.
2. Sudah ada `paymentMethod` → tampilkan `PaymentInstructions`: kode order, detail metode (QR
   placeholder / nomor VA fiktif), status saat ini, tombol dev-only **"Simulasikan Pembayaran
   Berhasil"**.
   - Klik tombol: status → `Diproses` seketika, lalu `setTimeout` ~1.5 detik → `Berhasil`. Ini
     memberi reviewer bukti visual bahwa status benar-benar berubah, bukan teks statis.
   - Setelah `Berhasil`, tombol simulasi disembunyikan/diganti indikator selesai.

### `/cek-transaksi`
Input kode order → `getOrderByCode`. Ketemu → detail lengkap (game, item, nominal, status dengan
badge warna, tanggal). Tidak ketemu/kosong → pesan "Transaksi tidak ditemukan" (state UI biasa,
bukan error/crash).

## Validasi & guardrails

- Step 2 tidak bisa memilih nominal sebelum Step 1 valid — dicek di handler, bukan hanya UI hint.
- Tombol "Pesan Sekarang!" disabled (bukan cuma visual — benar-benar `disabled` attribute) sampai
  kedua syarat terpenuhi.
- Tidak ada `alert()/confirm()/prompt()` di manapun — toast custom buatan sendiri
  (`components/Toast.tsx`, auto-dismiss).
- Badge kecil "DEMO — simulasi, bukan transaksi sungguhan" dipasang sekali di `app/layout.tsx`
  (muncul di semua halaman otomatis, bukan diulang manual per halaman).
- Tidak ada logo game berlisensi — ikon generik (lucide-react) + warna brand per game.
- Responsive mobile-first, target lebar minimum 390px.

## Format uang & bahasa

- Semua UI berbahasa Indonesia.
- `formatRupiah(n)` → `Rp 31.071` (pemisah ribuan titik, tanpa desimal/koma).

## Visual

Dark theme, aksen gradient ungu-biru neon untuk CTA/harga/badge status, kartu gelap dengan border
tipis, mengikuti pola layout DrianStore (bukan copy visual identik).

## Verifikasi (checklist di brief owner)

- `npm run build` sukses
- Semua route 200 di URL produksi Vercel (dicek setelah deploy)
- Alur inti 5 langkah (lihat brief) berhasil end-to-end
- Validasi "isi data akun dulu" benar-benar mencegah pemilihan nominal
- Kode order salah di Cek Transaksi → pesan yang tepat, bukan error
- `grep -rn "alert(\|confirm(\|prompt(" app/ components/ context/ lib/` kosong (project ini tidak
  memakai folder `src/` terpisah)
- Tampilan rapi di 390px
- Badge "DEMO — simulasi" ada di semua halaman
- Tidak ada logo game berlisensi

## Di luar scope (Tahap 1)

Payment gateway sungguhan, API provider H2H sungguhan, autentikasi sungguhan, database sungguhan,
fitur Joki/Live Streaming/Voucher/Kalkulator Win Rate yang benar-benar berjalan.
