import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * §25 — Page header. Eyebrow (optional) → H1 → supporting line → actions.
 * The actions slot wraps to its own full-width row below 640px so the primary
 * button stays a comfortable target.
 */
function PageHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header"
      className={cn('fade-up flex flex-col gap-3', className)}
      {...props}
    />
  )
}

function PageHeaderText({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-text"
      className={cn('flex min-w-0 flex-col gap-1', className)}
      {...props}
    />
  )
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn(
        'text-2xl font-semibold leading-8 tracking-[-0.025em] sm:text-3xl sm:leading-9',
        className,
      )}
      {...props}
    />
  )
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-header-description"
      className={cn('max-w-2xl text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  )
}

function PageHeaderActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn(
        'flex flex-col-reverse gap-2 max-[40rem]:w-full min-[40rem]:flex-row min-[40rem]:items-center',
        className,
      )}
      {...props}
    />
  )
}

export {
  PageHeader,
  PageHeaderText,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
}
