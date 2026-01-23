# Konfigurasi Forgot Password di Supabase

Dokumentasi ini menjelaskan cara mengkonfigurasi fitur Forgot Password di Supabase Dashboard agar berfungsi dengan benar.

## 📋 Overview

Fitur forgot password di aplikasi sudah diimplementasikan dengan flow berikut:
1. User klik "Lupa Password?" di halaman login
2. User memasukkan email
3. Sistem mengirim link reset password ke email user
4. User klik link di email → diarahkan ke `/auth/reset-password?access_token=xxx&refresh_token=xxx&type=recovery`
5. User memasukkan password baru
6. Password berhasil diubah → redirect ke halaman login

## 🔧 Konfigurasi Supabase Dashboard

### 1. Login ke Supabase Dashboard

Buka [https://supabase.com/dashboard](https://supabase.com/dashboard) dan login ke project Anda.

### 2. Configure Redirect URLs

Masuk ke **Authentication** → **URL Configuration**

#### Site URL
Isi dengan URL aplikasi Anda:
- **Development**: `http://localhost:3000`
- **Production**: `https://domain-anda.com`

#### Redirect URLs
Tambahkan URL berikut:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/reset-password`

Untuk production:
- `https://domain-anda.com/auth/callback`
- `https://domain-anda.com/auth/reset-password`

**Penting**: Pastikan URL **EXACTLY sama** dengan yang ada di kode, termasuk protokol (http/https) dan tidak ada trailing slash.

### 3. Configure Email Templates

Masuk ke **Authentication** → **Email Templates**

#### Reset Password Template

Klik tab **Reset Password** dan pastikan template berisi:

```html
<h2>Reset Password</h2>
<p>Hi {{ .User.Email }},</p>
<p>Klik link di bawah ini untuk reset password:</p>
<p>
  <a href="{{ .ConfirmationURL }}">
    Reset Password
  </a>
</p>
<p>Link ini akan kadaluarsa dalam 1 jam.</p>
<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
```

**Poin Penting**:
- Variabel `{{ .ConfirmationURL }}` **HARUS** ada dan tidak boleh diubah
- Ini akan otomatis diganti dengan URL: `http://localhost:3000/auth/reset-password?access_token=xxx&refresh_token=xxx&type=recovery`

### 4. Configure SMTP (Optional tapi Recommended)

Untuk development, Supabase menggunakan email service mereka sendiri. Untuk production, disarankan menggunakan SMTP server sendiri.

Masuk ke **Authentication** → **Email Provider** → **Custom SMTP**

Isi konfigurasi SMTP Anda:
- **SMTP Host**: `smtp.provider.com`
- **SMTP Port**: `587` (TLS) atau `465` (SSL)
- **SMTP User**: `email@domain.com`
- **SMTP Password**: `password-anda`
- **Sender Email**: `no-reply@domain.com`
- **Sender Name**: `Sistem RAB Leora`

Provider SMTP yang bisa digunakan:
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Brevo (Sendinblue)**: https://www.brevo.com/

### 5. Email Confirmation Settings

Masuk ke **Authentication** → **Providers** → **Email**

Atur:
- **Confirm email**: Off (opsional, tergantung kebutuhan)
- **Enable email confirmations**: Toggle sesuai kebutuhan
- **Secure email change**: On (recommended)

## 🧪 Testing

### Test Forget Password Flow

1. Buka aplikasi di `http://localhost:3000/login`
2. Klik "Lupa Password?"
3. Masukkan email yang sudah terdaftar di sistem
4. Cek email (termasuk folder spam)
5. Klik link reset password dari email
6. Masukkan password baru (minimal 6 karakter)
7. Klik "Ubah Password"
8. Seharusnya muncul pesan sukses dan redirect ke login
9. Coba login dengan password baru

### Debugging

#### Email Tidak Diterima

1. Cek folder **Spam/Junk** di email
2. Cek log di Supabase Dashboard → **Logs** → **Email Logs**
3. Pastikan SMTP sudah dikonfigurasi dengan benar
4. Coba kirim email manual dari Supabase Dashboard → **Authentication** → **Users** → klik user → **Send Magic Link**

#### Error "Link Reset Password Tidak Valid"

1. Pastikan Redirect URL sudah dikonfigurasi dengan benar
2. Pastikan token di URL lengkap (access_token, refresh_token, type)
3. Cek browser console untuk error message
4. Link reset password hanya valid selama 1 jam

#### Error "Session Error"

1. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah di-set di `.env.local`
2. Cek bahwa Supabase client sudah diinisialisasi dengan benar
3. Pastikan tidak ada error CORS di browser

## 🔍 Environment Variables

Pastikan file `.env.local` berisi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📝 Checklist

- [x] Implementasi kode sudah selesai
- [ ] Redirect URL sudah dikonfigurasi di Supabase Dashboard
- [ ] Email template sudah dikonfigurasi
- [ ] SMTP sudah dikonfigurasi (untuk production)
- [ ] Environment variables sudah di-set
- [ ] Testing end-to-end sudah dilakukan

## 🆘 Troubleshooting

### Masalah: Email tidak terkirim

**Solusi**:
1. Cek SMTP configuration di Supabase Dashboard
2. Cek Email Logs di Supabase Dashboard
3. Untuk development, gunakan email default Supabase (tanpa custom SMTP)

### Masalah: User tidak bisa reset password

**Solusi**:
1. Pastikan user sudah terdaftar di sistem
2. Cek bahwa email sudah terkonfirmasi (jika email confirmation diaktifkan)
3. Cek redirect URL di Supabase Dashboard

### Masalah: Password berhasil diubah tapi tidak bisa login

**Solusi**:
1. Pastikan password minimal 6 karakter
2. Coba refresh browser dan login lagi
3. Cek logs di Supabase Dashboard untuk error message

## 📞 Support

Jika masih mengalami masalah:
1. Cek console browser untuk error message
2. Cek Supabase Dashboard → **Logs**
3. Cek network tab di browser DevTools untuk request yang gagal
