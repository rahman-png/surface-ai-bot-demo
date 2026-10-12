# Surface Daily — Customer Book

Prototipe lokal aplikasi Customer Book untuk briefing dan tindak lanjut harian per klinik.

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```powershell
node server.mjs
```

Lalu buka <http://localhost:4173>.

## Fitur prototipe

- Briefing pagi per klinik: SB, CITOS, LMP, dan TSM.
- Maksimal 20 pelanggan per klinik per hari.
- Chat masuk pukul 20.00–10.00 yang belum dibalas berada di prioritas atas.
- Kategori aftercare, pelanggan berisiko, reaktivasi, ulang tahun, dan paket.
- Pencatatan hasil: membalas, booking, tidak merespons, dan follow-up nanti.
- Status tersimpan lokal di browser melalui `localStorage`.
- Data yang tampil seluruhnya data contoh anonim.

## Tahap integrasi berikutnya

1. Ganti data contoh dengan query Supabase.
2. Tambahkan login serta pembatasan akses per klinik.
3. Hubungkan tombol chat ke WooBlazz.
4. Simpan outcome dan aturan cooldown ke database.
5. Jalankan penyusun daftar otomatis setiap pagi.
