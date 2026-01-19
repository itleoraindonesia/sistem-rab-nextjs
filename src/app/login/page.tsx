"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { supabase } from "../../lib/supabase/client"
import { Mail, CheckCircle } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim magic link")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-primary mb-2">
              Sistem RAB Leora
            </h1>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cek Email Anda!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Kami telah mengirim magic link ke:
                  </p>
                  <p className="font-semibold text-brand-primary mb-4">
                    {email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Klik link di email untuk login. Link akan expire dalam 1 jam.
                  </p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" asChild className="w-full">
                    <a
                      href={`https://team.leora.co.id/webmail/?_user=${encodeURIComponent(email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cek Email Masuk
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>Tidak menerima email?</p>
            <p className="mt-1">Cek folder spam atau tunggu beberapa menit.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">
            Sistem RAB Leora
          </h1>
          <p className="text-gray-600">Masuk dengan Magic Link</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
              Login Tanpa Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Perusahaan</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    autoComplete="email"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Kami akan mengirim magic link ke email Anda
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Mengirim Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Kirim Magic Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900 font-medium mb-2">
                🔐 Login Tanpa Password
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ Lebih aman - tidak perlu ingat password</li>
                <li>✓ Cepat - cukup klik link di email</li>
                <li>✓ Magic link expire dalam 1 jam</li>
                <li>✓ Session bertahan 30 hari</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Pastikan Anda sudah terdaftar di sistem.</p>
          <p className="mt-1">Hubungi admin jika belum memiliki akses.</p>
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
