"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(username, password);

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || "Login gagal");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-brand-primary mb-2'>
            Sistem RAB Leora
          </h1>
          <p className='text-gray-600'>Masuk ke akun Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-center bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent'>
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  name='username'
                  type='text'
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Masukkan username'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Masukkan password'
                />
              </div>

              {error && (
                <div className='text-center text-sm text-destructive'>
                  {error}
                </div>
              )}

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? "Sedang Masuk..." : "Masuk"}
              </Button>
            </form>

            <div className='mt-6 text-center text-sm text-gray-600'>
              <p>Demo credentials:</p>
              <p>
                Username:{" "}
                <code className='bg-gray-100 px-1 rounded'>user1</code>
              </p>
              <p>
                Password:{" "}
                <code className='bg-gray-100 px-1 rounded'>user123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto'></div>
            <p className='mt-4 text-gray-600'>Memuat...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
