"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";

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
            <CardTitle className='text-center'>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label
                  htmlFor='username'
                  className='block text-sm font-medium text-gray-700'
                >
                  Username
                </label>
                <input
                  id='username'
                  name='username'
                  type='text'
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary'
                  placeholder='Masukkan username'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary'
                  placeholder='Masukkan password'
                />
              </div>

              {error && (
                <div className='text-red-600 text-sm text-center'>{error}</div>
              )}

              <Button
                type='submit'
                className='w-full bg-green-800 text-white hover:bg-green-700 '
                disabled={isLoading}
              >
                {isLoading ? "Sedang Masuk..." : "Masuk"}
              </Button>
            </form>

            <div className='mt-6 text-center text-sm text-gray-600'>
              <p>Demo credentials:</p>
              <p>
                Username:{" "}
                <code className='bg-gray-100 px-1 rounded'>admin</code>
              </p>
              <p>
                Password:{" "}
                <code className='bg-gray-100 px-1 rounded'>password</code>
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
