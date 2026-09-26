import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * §24.1 — Eyebrow. 12px, 600, uppercase, 0.05em, muted.
 * The only sanctioned way to introduce a section above its own heading.
 */
function Eyebrow({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        'text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Eyebrow }
