# GacorStore — Demo Top Up Voucher Game (Tahap 1)

Demo web top-up voucher game bergaya DrianStore. Ini demo **Tahap 1**: seluruh alur (pilih game,
isi data akun, pilih nominal, checkout, cek transaksi) berjalan penuh secara mock — **tanpa**
payment gateway sungguhan dan **tanpa** API provider H2H sungguhan. Data game/harga statis di
`data/seed.ts`; transaksi disimpan di React Context + `localStorage` (tanpa database sungguhan).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Menjalankan test

```bash
npm run test
```

Unit test menutupi logika murni: `formatRupiah`, `generateOrderCode` (`lib/format.test.ts`) dan
`isAccountValid` (`lib/orderLogic.test.ts`).

## Build produksi

```bash
npm run build
```

## Alur inti untuk dicoba (5 langkah)

1. Buka `/produk/mobile-legends`, klik salah satu kartu nominal **sebelum** mengisi ID+Server →
   muncul pesan "Silahkan isi data akun terlebih dahulu.".
2. Isi ID+Server, pilih nominal, klik **Pesan Sekarang!** → diarahkan ke halaman checkout.
3. Pilih metode bayar (QRIS/Virtual Account) → muncul instruksi bayar dengan kode order unik.
4. Klik tombol **[DEV] Simulasikan Pembayaran Berhasil** → status berubah
   Menunggu Pembayaran → Diproses → Berhasil (otomatis, tanpa reload).
5. Buka `/cek-transaksi`, masukkan kode order tadi → detail transaksi muncul. Coba kode asal-asalan
   → muncul pesan "Transaksi tidak ditemukan." (bukan error/crash).

## Di luar scope demo ini

Payment gateway sungguhan, API provider H2H sungguhan (Digiflazz atau sejenis), autentikasi
sungguhan, database sungguhan, dan fitur Live Streaming/Voucher/Joki yang benar-benar berjalan
(ketiganya berlabel "Segera" di homepage).
