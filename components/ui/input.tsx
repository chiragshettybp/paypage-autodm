import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * §10 — Input.
 * Borderless: no visible stroke at rest, depth from --field-shadow.
 * 12px radius, 8/12 padding. 40px tall and 16px text below 640px so iOS never
 * zooms on focus; 36px and 14px from 640px up.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'input',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'selection:bg-accent-soft selection:text-foreground',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
