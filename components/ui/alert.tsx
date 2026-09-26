import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * §17.4 — Alert. 20px radius, soft tone fill, tone-coloured icon, 16px gap
 * between icon and text. 24px gap is too loose at 14px type.
 */
const alertVariants = cva(
  [
    'relative flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
    '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:translate-y-0.5',
  ],
  {
    variants: {
      variant: {
        /** Neutral inline notice */
        default: 'border-border bg-surface-secondary text-foreground',
        accent: 'border-transparent bg-accent-soft text-accent-soft-foreground',
        success: 'border-transparent bg-success-soft text-success-soft-foreground',
        warning: 'border-transparent bg-warning-soft text-warning-soft-foreground',
        destructive:
          'border-transparent bg-danger-soft text-danger-soft-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('text-sm font-semibold leading-5', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-sm leading-5 opacity-90',
        '*:data-[slot=alert-description]:text-inherit',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
