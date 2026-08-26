'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useEmployees, useUpdateEmployee } from '@/features/employees/hooks/useEmployees';
import { preferencesApi } from '../api/preferencesApi';

const languageOptions = [
  { value: 'uz', label: "O'zbekcha" },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

const themeOptions = [
  { value: 'system', label: 'Tizim bo\'yicha' },
  { value: 'dark', label: 'Qorong\'i' },
  { value: 'light', label: 'Yorug\'' },
];

export function SettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useEmployees();
  const myProfile = employees.find((e) => String((e as { userId?: string }).userId) === user?.id);
  const updateEmployee = useUpdateEmployee();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (myProfile) {
      setEmail(myProfile.email ?? '');
      setPhone(myProfile.phone ?? '');
    }
  }, [myProfile]);

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: preferencesApi.get,
  });

  const updatePreferences = useMutation({
    mutationFn: preferencesApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data);
      toast.success('Sozlamalar saqlandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Xatolik yuz berdi'),
  });

  const handleSaveProfile = async () => {
    if (!myProfile) return;
    await updateEmployee.mutateAsync({
      id: String(myProfile.id),
      input: {
        orgRole: myProfile.role,
        department: myProfile.department || undefined,
        position: myProfile.position || undefined,
        hireDate: myProfile.hireDate || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
    });
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Profil sozlamalari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="To'liq ism" value={user?.fullName ?? ''} disabled readOnly />
          {myProfile ? (
            <>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Button variant="primary" onClick={handleSaveProfile} loading={updateEmployee.isPending}>
                Saqlash
              </Button>
            </>
          ) : (
            <p className="text-caption text-[var(--color-text-muted)]">
              Bu ish maydonida xodim profilingiz mavjud emas — email/telefon tahrirlash uchun administrator siz uchun profil yaratishi kerak.
            </p>
          )}
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Til va ko'rinish</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferencesLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <Select
                label="Til"
                options={languageOptions}
                value={preferences?.uiLanguage ?? 'uz'}
                onChange={(e) => updatePreferences.mutate({ uiLanguage: e.target.value })}
              />
              <Select
                label="Ko'rinish"
                options={themeOptions}
                value={preferences?.theme ?? 'system'}
                onChange={(e) => updatePreferences.mutate({ theme: e.target.value })}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
