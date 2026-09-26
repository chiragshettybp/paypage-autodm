import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * §15.2 — Status pill. The only permitted way to show a live/enabled/disabled
 * state. Soft tone fill, 12px, 24px radius. `live` is the accent family;
 * the other tones exist for genuine status only.
 */
const statusPillVariants = cva(
  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-3xl px-2.5 py-1 text-xs font-medium leading-4',
  {
    variants: {
      tone: {
        neutral: 'bg-secondary text-secondary-foreground',
        live: 'bg-success-soft text-success-soft-foreground',
        accent: 'bg-accent-soft text-accent-soft-foreground',
        warning: 'bg-warning-soft text-warning-soft-foreground',
        danger: 'bg-danger-soft text-danger-soft-foreground',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  /** Renders a 6px dot in the pill's own colour. Omit for text-only pills. */
  dot?: boolean
}

function StatusPill({ className, tone, dot = true, children, ...props }: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      className={cn(statusPillVariants({ tone }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current opacity-70"
        />
      )}
      {children}
    </span>
  )
}

export { StatusPill, statusPillVariants }
