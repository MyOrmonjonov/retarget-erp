'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  username: z.string().min(3, 'Foydalanuvchi nomi kamida 3 belgidan iborat bo\'lishi kerak'),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo\'lishi kerak'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const login = useLogin();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-md animate-in">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <span className="text-[var(--color-bg-primary)] font-bold text-2xl">R</span>
          </div>
          <div>
            <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">Retarget ERP</h1>
            <p className="text-caption text-[var(--color-text-secondary)]">Boshqaruv tizimi</p>
          </div>
        </div>

        <Card variant="default" className="shadow-lg">
          <CardHeader>
            <CardTitle>Tizimga kirish</CardTitle>
            <CardDescription>Foydalanuvchi nomi va parolingizni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                {...register('username')}
                label="Foydalanuvchi nomi"
                type="text"
                placeholder="admin"
                autoComplete="username"
                error={errors.username?.message}
                disabled={login.isPending}
              />
              <Input
                {...register('password')}
                label="Parol"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                disabled={login.isPending}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={login.isPending}
              >
                {!login.isPending && <LogIn className="h-4 w-4" />}
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-caption text-[var(--color-text-muted)]">
          © 2026 Retarget ERP. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}
