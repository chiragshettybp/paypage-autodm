import { cn } from '@/lib/utils'

/**
 * §16.2 — Skeleton. Washed blocks, never the accent. 6px radius unless the
 * caller says otherwise.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('skeleton-wash animate-pulse rounded-sm', className)}
      {...props}
    />
  )
}

export { Skeleton }
