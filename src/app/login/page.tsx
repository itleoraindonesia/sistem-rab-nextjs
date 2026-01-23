"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "../../components/ui"

import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { supabase } from "../../lib/supabase/client"
import { Mail, Eye, EyeOff, Lock, AlertCircle } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah. Silakan coba lagi.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email belum dikonfirmasi. Silakan cek email Anda.'
        }
        setError(errorMessage)
      } else if (data.user) {
        // Redirect to the intended page or dashboard
        router.push(redirect)
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.")
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setError("") // Clear any previous errors
        alert("Link reset password telah dikirim ke email Anda. Silakan cek email dan ikuti instruksi untuk mengatur ulang password.")
        setIsForgotPassword(false)
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim email reset password")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Kiri: Gambar Konstruksi (2/3) */}
      <div className="hidden lg:flex w-2/3 relative bg-slate-900 overflow-hidden">
        <Image
          src="/login-bg.png"
          alt="Construction Site"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
        
        <div className="absolute bottom-16 left-16 max-w-xl text-white z-10">

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Membangun Masa Depan dengan Presisi
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed text-balance">
            Solusi Enterprise Resource Planning terintegrasi untuk efisiensi operasional, manajemen konstruksi, dan kontrol bisnis yang menyeluruh.
          </p>
        </div>
      </div>

      {/* Kanan: Login Form (1/3) */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 overflow-y-auto bg-white">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <div className="mb-6 md:mb-12 flex flex-col items-center lg:items-start">
              <Image 
                 src="/Logo-Leora-PNG.png" 
                 alt="Logo Leora" 
                 width={500} 
                 height={500} 
                 className="w-48 md:w-64 h-auto object-contain"
               />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h2>
            <p className="mt-2 text-slate-600">
              Silakan masuk untuk mengakses dashboard proyek Anda.
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-slate-700 font-medium">Email Perusahaan</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    autoComplete="email"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Masukkan email untuk menerima link reset password.
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Link Reset Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Kembali ke Login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@perusahaan.com"
                      autoComplete="email"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs font-medium text-brand-primary hover:text-brand-accent"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Lupa Password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Masuk...
                  </>
                ) : (
                  "Masuk ke Akun"
                )}
              </Button>
            </form>
          )}

          <div className="pt-6 border-t border-slate-100">
             <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock className="w-3 h-3" />
                <span>Terenskripsi & Aman</span>
                <span>•</span>
                <span>ERP Leora v1.0</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
