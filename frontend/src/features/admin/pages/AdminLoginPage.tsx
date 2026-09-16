'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { adminApi } from '../api/adminApi';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await adminApi.login(username, password);
      setAuth(result.username, result.accessToken);
      navigate('/admin');
    } catch (err) {
      setError((err as { message?: string })?.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-sm animate-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-text-primary)] flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[var(--color-bg-primary)]" />
          </div>
          <div>
            <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">Admin Panel</h1>
            <p className="text-caption text-[var(--color-text-secondary)]">Retarget ERP boshqaruvi</p>
          </div>
        </div>

        <Card variant="default" className="shadow-lg">
          <CardHeader>
            <CardTitle>Kirish</CardTitle>
            <CardDescription>Faqat vakolatli shaxslar uchun</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Login"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
              <Input
                label="Parol"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error && (
                <div className="flex items-start gap-3 rounded-[10px] bg-[var(--color-error-muted)] px-4 py-3">
                  <TriangleAlert className="h-5 w-5 shrink-0 text-[var(--color-error)]" />
                  <p className="text-body text-[var(--color-text-secondary)]">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
