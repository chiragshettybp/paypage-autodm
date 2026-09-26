import * as React from 'react'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * §14.3 — Stat card. Label 12px/muted, value 30px/600, delta 12px.
 * A delta is ALWAYS signed and coloured: positive is success, negative is
 * danger, neutral is muted. An unlabelled percentage change is a lie.
 */
function StatCard({
  label,
  value,
  delta,
  positive,
  deltaLabel,
  icon: Icon,
  hint,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  /** Signed percentage or absolute change, e.g. "+12.4%". Pass null to hide. */
  delta?: string | number | null
  /**
   * Whether the delta is good news. Leave it out and the sign decides, which
   * is right for most metrics — but "messages sent −12%" is not automatically
   * bad, so pass this explicitly when the direction of "good" differs from
   * the sign.
   */
  positive?: boolean
  deltaLabel?: string
  /** Lucide icon component. Rendered at 16px, muted. */
  icon?: React.ComponentType<{ className?: string }>
  hint?: React.ReactNode
  className?: string
}) {
  const hasDelta = delta !== null && delta !== undefined && delta !== ''
  const looksPositive =
    typeof delta === 'number'
      ? delta >= 0
      : !String(delta).trim().startsWith('-')
  const good = hasDelta ? (positive ?? looksPositive) : false
  const DeltaIcon = good ? TrendingUpIcon : TrendingDownIcon

  return (
    <div data-slot="stat-card" className={cn('card flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium leading-4 text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-3xl font-semibold leading-9 tracking-[-0.025em] tabular-nums">
          {value}
        </span>
        {hasDelta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium leading-4 tabular-nums',
              good ? 'text-success-soft-foreground' : 'text-danger-soft-foreground',
            )}
          >
            <DeltaIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {typeof delta === 'number' ? `${delta > 0 ? '+' : ''}${delta}` : delta}
          </span>
        )}
      </div>
      {(deltaLabel || hint) && (
        <p className="text-xs leading-4 text-muted-foreground">
          {deltaLabel ?? hint}
        </p>
      )}
    </div>
  )
}

export { StatCard }
