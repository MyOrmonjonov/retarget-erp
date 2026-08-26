'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-bg-surface)] p-1 text-body',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    badge?: number;
  }
>(({ className, badge, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative flex h-8 items-center justify-center rounded-md px-3 py-1.5 text-body font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
      'data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-[var(--color-bg-primary)] data-[state=active]:shadow-sm',
      'data-[state=inactive]:text-[var(--color-text-secondary)] data-[state=inactive]:hover:text-[var(--color-text-primary)] data-[state=inactive]:hover:bg-[var(--color-bg-hover)]',
      className
    )}
    {...props}
  >
    {children}
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-5 rounded-full bg-[var(--color-error)] text-[10px] font-bold flex items-center justify-center px-1.5">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-0 focus-visible:ring-0 data-[state=active]:animate-in data-[state=inactive]:animate-out',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };