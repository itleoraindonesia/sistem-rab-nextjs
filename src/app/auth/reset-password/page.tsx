"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "../../../components/ui"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { supabase } from "../../../lib/supabase/client"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get tokens from URL parameters
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama")
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setIsLoading(true)

    try {
      // If it's a password recovery flow, set the session first
      if (type === 'recovery' && accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError("Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.")
          console.error("Session error:", sessionError)
          setIsLoading(false)
          return
        }
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengubah password")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show error if no valid token provided
  if (type === 'recovery' && (!accessToken || !refreshToken)) {
    return (
      <div className="flex min-h-screen w-full bg-white">
        <div className="w-full flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="text-center">
              <div className="mb-6 md:mb-12 flex flex-col items-center">
                <Image 
                  src="/Logo-Leora-PNG.png" 
                  alt="Logo Leora" 
                  width={500} 
                  height={500} 
                  className="w-48 md:w-64 h-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Link Reset Password Tidak Valid
              </h1>
              <p className="mt-2 text-slate-600">
                Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link reset password baru dari halaman login.
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button onClick={() => router.push("/login")} className="w-full h-11 text-base shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all font-semibold">
              Ke Halaman Login
            </Button>

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

  if (success) {
    return (
      <div className="flex min-h-screen w-full bg-white">
        <div className="w-full flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="text-center">
              <div className="mb-6 md:mb-12 flex flex-col items-center">
                <Image 
                  src="/Logo-Leora-PNG.png" 
                  alt="Logo Leora" 
                  width={500} 
                  height={500} 
                  className="w-48 md:w-64 h-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Password Berhasil Diubah!
              </h1>
              <p className="mt-2 text-slate-600">
                Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <Button onClick={() => router.push("/login")} className="w-full h-11 text-base shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all font-semibold">
              Ke Halaman Login
            </Button>

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

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="w-full flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="text-center">
            <div className="mb-6 md:mb-12 flex flex-col items-center">
              <Image 
                src="/Logo-Leora-PNG.png" 
                alt="Logo Leora" 
                width={500} 
                height={500} 
                className="w-48 md:w-64 h-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Atur Ulang Password
            </h1>
            <p className="mt-2 text-slate-600">
              Masukkan password baru untuk akun Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-700 font-medium">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  Mengubah Password...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
          </form>

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

export default function ResetPassword() {
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
      <ResetPasswordForm />
    </Suspense>
  )
}
