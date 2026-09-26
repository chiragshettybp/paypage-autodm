import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * §6.3 — Badge, 24px radius, neutral by default. Tone variants exist for
 * status only; nothing decorative should be coloured.
 */
const badgeVariants = cva(
  [
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-3xl',
    'px-2.5 py-1 text-xs font-medium leading-4',
    'transition-standard',
  ],
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent-soft text-accent-soft-foreground',
        success: 'bg-success-soft text-success-soft-foreground',
        warning: 'bg-warning-soft text-warning-soft-foreground',
        danger: 'bg-danger-soft text-danger-soft-foreground',
        outline: 'border border-border text-foreground',
        /** Solid yellow, for the current step in a wizard */
        primary: 'bg-primary text-primary-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants, type BadgeProps }
