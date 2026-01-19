import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, Home, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UnauthorizedPage() {
  // Check if user is actually logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">
            Sistem RAB Leora
          </h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Akses Ditolak</CardTitle>
            <CardDescription>
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>Halaman ini memerlukan izin khusus yang tidak dimiliki akun Anda.</p>
              <p>Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.</p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Kembali ke Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Butuh bantuan? Hubungi tim IT</p>
        </div>
      </div>
    </div>
  )
}
