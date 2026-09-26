import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * §11 — Card.
 * 16px radius, 1px --border, shadow-sm, 16px base padding, 12px vertical gap.
 *
 * Radius and shadow are owned by the `.card` utility in globals.css so a
 * `rounded-*` class can still override them deliberately. Do not add a radius
 * utility here.
 */
const cardVariants = cva('card', {
  variants: {
    padding: {
      none: 'card-none',
      sm: 'card-sm',
      md: 'card-md',
      lg: 'card-lg',
    },
    interactive: {
      true: 'card-hover cursor-pointer',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
})

type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants>

function Card({ className, padding, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        cardVariants({ padding, interactive }),
        'flex flex-col gap-3',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex items-start justify-between gap-3 empty:hidden',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-xl font-semibold leading-7', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'ml-auto flex shrink-0 items-start gap-2 self-start',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-content" className={cn('min-w-0', className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('mt-auto flex items-center gap-2 pt-1', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  type CardProps,
}
