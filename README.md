# Demo Top-Up Voucher Game

Demo web top-up voucher game. Alur lengkapnya bisa dicoba (pilih game, isi ID akun, pilih nominal, checkout, cek transaksi), tapi semuanya berjalan dengan data tiruan: tanpa payment gateway, tanpa API provider, dan tanpa database. Data game dan harga ada di `data/seed.ts`, transaksi disimpan di React Context dan `localStorage`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Test

```bash
npm run test
```

Unit test mencakup `formatRupiah`, `generateOrderCode` (`lib/format.test.ts`), dan `isAccountValid` (`lib/orderLogic.test.ts`).

## Alur untuk dicoba

1. Buka `/produk/mobile-legends`, klik nominal sebelum mengisi ID dan Server. Muncul peringatan untuk mengisi data akun.
2. Isi ID dan Server, pilih nominal, klik **Pesan Sekarang**. Halaman pindah ke checkout.
3. Pilih QRIS atau Virtual Account. Muncul instruksi bayar dengan kode order.
4. Klik **[DEV] Simulasikan Pembayaran Berhasil**. Status berubah dari Menunggu Pembayaran ke Diproses lalu Berhasil.
5. Buka `/cek-transaksi` dan masukkan kode order. Detail transaksi muncul. Kode yang salah menampilkan "Transaksi tidak ditemukan."

## Belum termasuk

Payment gateway, integrasi provider (misalnya Digiflazz), login, database, dan fitur yang masih berlabel "Segera" di halaman utama.
