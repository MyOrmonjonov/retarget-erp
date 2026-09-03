'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/card';

interface LoadingScreenProps {
  label?: string;
}

/** Ported from the reference CRM's boot-time LoadingScreen: an animated progress ring
 * counting 0-100%, a floating card, and a drifting gradient background - shown while the
 * Telegram Mini App session is being verified, before the routed app takes over. */
export function LoadingScreen({ label = 'CRM yuklanmoqda...' }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: ReturnType<typeof setTimeout>;
    function tick() {
      setProgress((current) => {
        if (current >= 100) return 100;
        return current + 1;
      });
      frame = setTimeout(tick, 8);
    }
    tick();
    return () => clearTimeout(frame);
  }, []);

  const size = 76;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const stage = progress < 35
    ? "Ma'lumotlar yuklanmoqda"
    : progress < 70
      ? 'Realtime ulanish tayyorlanmoqda'
      : 'CRM ishga tushirilmoqda';

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-accent-muted) 100%)' }}
    >
      <div
        className="absolute inset-[-15%] animate-loader-drift"
        style={{
          background: 'radial-gradient(circle at 30% 25%, rgba(0,113,227,.08), transparent 28%),'
            + 'radial-gradient(circle at 72% 68%, rgba(90,200,250,.12), transparent 24%),'
            + 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.55), transparent 46%)',
        }}
      />
      <Card className="relative z-10 text-center max-w-[380px] p-8 animate-loader-float">
        <div className="relative mx-auto" style={{ width: size, height: size }}>
          <div
            className="absolute animate-loader-pulse rounded-full"
            style={{ inset: -10, background: 'radial-gradient(circle, rgba(0,113,227,.18), rgba(0,113,227,0) 70%)' }}
          />
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,113,227,.12)" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#loaderBlue)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.18s ease' }}
            />
            <defs>
              <linearGradient id="loaderBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="55%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-[10px] rounded-full bg-[var(--color-bg-surface)] shadow-[inset_0_1px_0_rgba(255,255,255,.9)]" />
          <div className="absolute inset-0 flex items-center justify-center font-black text-[16px] text-[var(--color-accent)]">
            {progress}%
          </div>
        </div>
        <p className="mt-[18px] font-extrabold text-[var(--color-text-primary)]">{label}</p>
        <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)]">
          Realtime CRM ma'lumotlari tayyorlanmoqda.
        </p>
        <p className="mt-3 text-[12px] font-bold text-[var(--color-text-muted)]">{stage}</p>
      </Card>
    </div>
  );
}
