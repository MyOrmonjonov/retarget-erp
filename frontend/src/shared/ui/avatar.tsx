import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/shared/lib/utils';
import { getInitials } from '@/shared/lib/utils';

// Ported from the reference CRM's own Avatar: a deterministic color per person (keyed off the
// first character of their name) instead of one flat neutral fallback - it's what makes a
// list of people scannable by avatar color alone, not just by reading each name.
const AVATAR_PALETTE = [
  'var(--color-accent)', 'var(--color-role-staff)', 'var(--color-warning)',
  'var(--color-success)', 'var(--color-role-operator)', '#E11D48',
];

function avatarColor(name?: string): string {
  if (!name) return AVATAR_PALETTE[0];
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, name, size = 'md', src, alt, ...props }, ref) => {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-caption',
    md: 'h-10 w-10 text-body',
    lg: 'h-12 w-12 text-body',
    xl: 'h-16 w-16 text-h3',
  };

  const fallback = name ? getInitials(name) : undefined;

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn('relative flex shrink-0 overflow-hidden rounded-full', sizes[size], className)}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt || name || 'Avatar'}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full text-white font-bold tracking-tight',
          sizes[size]
        )}
        style={{ backgroundColor: avatarColor(name) }}
        delayMs={600}
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar };