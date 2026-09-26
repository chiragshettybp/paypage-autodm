'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

/**
 * §12.4 — Switch. 44×24 track, 20px thumb, brand yellow when on.
 * Off state is a surface wash with a visible thumb so it never reads as
 * "on but broken".
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5',
        'border border-transparent transition-standard',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-tertiary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // 44px touch target without changing the visual track (§6.4)
        'before:absolute before:-inset-y-2 before:inset-x-[-6px] before:content-[""]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-card shadow-xs ring-0',
          'transition-transform duration-[var(--motion-normal)] ease-[var(--motion-ease)]',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
