import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * §10 — Textarea. Same field treatment as Input; min 64px so the keyboard
 * preview and default padding do not collapse it.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'input textarea',
        'placeholder:text-muted-foreground',
        'field-sizing-content',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
