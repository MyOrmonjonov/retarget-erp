'use client';

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  showLabel?: boolean;
  className?: string;
  fillColor?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className,
  fillColor,
}: CircularProgressProps) {
  const variants = {
    default: 'stroke-[var(--color-accent)]',
    success: 'stroke-[var(--color-success)]',
    warning: 'stroke-[var(--color-warning)]',
    error: 'stroke-[var(--color-error)]',
    accent: 'stroke-[var(--color-accent)]',
  };

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {fillColor && <circle fill={fillColor} stroke="none" cx={size / 2} cy={size / 2} r={size / 2} />}
        <circle
          className="fill-none stroke-[var(--color-bg-border)]"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={`${variants[variant]} fill-none transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-bold text-[var(--color-text-primary)]"
          style={{ fontSize: Math.max(size * 0.22, 10) }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}