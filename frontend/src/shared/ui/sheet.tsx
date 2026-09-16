'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// A side-anchored variant of Dialog (right-slide-in "sheet") - same Radix primitives as dialog.tsx,
// just anchored to the viewport edge instead of centered.
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed right-0 top-0 z-[var(--z-modal)] flex h-full w-[85vw] max-w-[360px] flex-col bg-[var(--color-bg-surface)] border-l border-[var(--color-bg-border)] shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        'data-[state=closed]:duration-200 data-[state=open]:duration-300',
        className
      )}
      {...props}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <DialogPrimitive.Close className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-[var(--color-bg-surface)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:pointer-events-none" aria-label="Yopish">
        <X className="h-4 w-4" />
        <span className="sr-only">Yopish</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetTrigger, SheetPortal, SheetClose, SheetOverlay, SheetContent };
