'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

export function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-in">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Profil sozlamalari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="To'liq ism" defaultValue="Aziz Karimov" />
          <Input label="Email" type="email" defaultValue="aziz@retarget.uz" />
          <Input label="Telefon" defaultValue="+998 90 123 45 67" />
          <Button variant="primary">Saqlash</Button>
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Xavfsizlik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="secondary">Parolni o'zgartirish</Button>
          <Button variant="secondary">Ikki bosqichli autentifikatsiya</Button>
        </CardContent>
      </Card>
    </div>
  );
}