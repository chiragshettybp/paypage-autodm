import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { RotateCwIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

/**
 * §16 — The three async states, in one file so they can never drift apart.
 *  16.1 page loader · 16.2 skeletons · 16.3 empty · 16.4 error
 */

/** §16.1 — Full-page loader. Spinner, accent colour, 8px label, 32px above. */
function FullPageLoader({
  className,
  label = 'Loading',
  ...props
}: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <div
      data-slot="full-page-loader"
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-[50dvh] w-full flex-col items-center justify-center gap-2 text-center',
        className,
      )}
      {...props}
    >
      <Spinner className="text-2xl text-primary" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

/** §16.1 — Inline loader for a button-shaped or row-shaped region. */
function InlineLoader({
  className,
  label = 'Loading',
  ...props
}: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <div
      data-slot="inline-loader"
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-32 w-full flex-col items-center justify-center gap-2 text-center',
        className,
      )}
      {...props}
    >
      <Spinner className="text-xl text-primary" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

/** §16.2 — List skeleton. `count` washes shaped like list rows. */
function ListSkeleton({
  count = 3,
  className,
  ...props
}: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div
      data-slot="list-skeleton"
      aria-hidden="true"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-3xl" />
        </div>
      ))}
    </div>
  )
}

/** §16.2 — Stat card skeleton matching the real stat card footprint. */
function StatCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="stat-card-skeleton"
      aria-hidden="true"
      className={cn('card flex flex-col gap-3', className)}
      {...props}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

const emptyStateMediaVariants = cva('flex size-12 items-center justify-center rounded-xl', {
  variants: {
    tone: {
      neutral: 'bg-surface-secondary text-foreground',
      accent: 'bg-accent-soft text-accent-soft-foreground',
      warning: 'bg-warning-soft text-warning-soft-foreground',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

/** §16.3 — Empty state. 400px max, 20px dashed radius, 32px padding. */
function EmptyState({
  className,
  title,
  description,
  icon,
  tone,
  action,
  ...props
}: React.ComponentProps<typeof Empty> & {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  tone?: VariantProps<typeof emptyStateMediaVariants>['tone']
  action?: React.ReactNode
}) {
  return (
    <Empty className={cn('fade-up', className)} {...props}>
      {icon && (
        <EmptyMedia variant={tone === 'accent' ? 'primary' : 'icon'}>
          <span className={cn(emptyStateMediaVariants({ tone }))}>{icon}</span>
        </EmptyMedia>
      )}
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

const errorStateMediaVariants = cva(
  'flex size-12 items-center justify-center rounded-xl [&_svg]:size-6',
  {
    variants: {
      tone: {
        danger: 'bg-danger-soft text-destructive',
        warning: 'bg-warning-soft text-warning-soft-foreground',
      },
    },
    defaultVariants: { tone: 'danger' },
  },
)

/**
 * §16.4 — Error state. Never a toast: a failed page load or list fetch is
 * persistent, so it gets a real container with a retry.
 */
function ErrorState({
  className,
  title = 'Something went wrong',
  description,
  error,
  onRetry,
  retrying = false,
  retryLabel = 'Try again',
  tone,
  ...props
}: React.ComponentProps<'div'> & {
  title?: React.ReactNode
  description?: React.ReactNode
  error?: unknown
  onRetry?: () => void
  retrying?: boolean
  retryLabel?: string
  tone?: VariantProps<typeof errorStateMediaVariants>['tone']
}) {
  // A raw API error is shown so the user can act on it, but it is never the
  // headline — the headline says what happened, not what the server said.
  const detail =
    typeof error === 'string' && error.trim().length > 0
      ? error
      : error instanceof Error
        ? error.message
        : null

  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        'fade-up flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-8 text-center sm:p-8',
        className,
      )}
      {...props}
    >
      <span className={cn(errorStateMediaVariants({ tone }))}>
        <RotateCwIcon />
      </span>
      <div className="flex max-w-sm flex-col items-center gap-2">
        <h2 className="text-xl font-semibold leading-7">{title}</h2>
        {description && (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        )}
        {detail && (
          <p className="max-w-full break-words text-xs leading-4 text-muted-foreground/80">
            {detail}
          </p>
        )}
      </div>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          loading={retrying}
          className="mt-1"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

/**
 * §16 — One component for the whole list surface. Renders exactly one of
 * loading / error / empty / children, so those four can never appear together.
 */
function AsyncBoundary({
  isLoading,
  error,
  isEmpty,
  onRetry,
  retrying,
  skeleton,
  empty,
  children,
  className,
}: {
  isLoading: boolean
  error?: unknown
  isEmpty?: boolean
  onRetry?: () => void
  retrying?: boolean
  skeleton?: React.ReactNode
  empty?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  if (isLoading) return <>{skeleton ?? <ListSkeleton />}</>
  if (error) return <ErrorState error={error} onRetry={onRetry} retrying={retrying} className={className} />
  if (isEmpty) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>
  return <>{children}</>
}

export {
  FullPageLoader,
  InlineLoader,
  ListSkeleton,
  StatCardSkeleton,
  EmptyState,
  ErrorState,
  AsyncBoundary,
}
