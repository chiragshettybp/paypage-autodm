import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

/**
 * §8 — Buttons.
 * Radius 24px at every size. 40px tall, 36px from 640px up. Content-aligned
 * horizontal padding with a 16px floor. Press scale 0.99. Loading swaps the
 * label for a spinner while holding width.
 */
const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap',
    'rounded-3xl font-medium leading-none transition-standard',
    'disabled:pointer-events-none disabled:opacity-50',
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    // Touch target: 44px below 640px, never above the visual height (§6.4, §20.3)
    'max-[40rem]:min-h-11',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // The single primary action on a view (§8.2)
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.99]',
        // Neutral fill for everything else that needs a boundary
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:scale-[0.99]',
        // Inherits the card surface; gains a border on hover
        ghost: 'text-foreground hover:bg-surface-secondary active:scale-[0.99]',
        outline:
          'border border-border bg-card text-foreground shadow-xs hover:bg-surface-secondary active:scale-[0.99]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:scale-[0.99]',
        link: 'rounded-lg text-foreground underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm max-[40rem]:h-10 has-[>svg:not(.sr-only)]:px-3',
        // `default` is an alias of `md` kept so shadcn components that pass
        // size="default" keep type-checking
        default: 'h-10 px-4 text-sm max-[40rem]:h-11 has-[>svg:not(.sr-only)]:px-4',
        md: 'h-10 px-4 text-sm max-[40rem]:h-11 has-[>svg:not(.sr-only)]:px-4',
        lg: 'h-12 px-6 text-base max-[40rem]:h-12 has-[>svg:not(.sr-only)]:px-5',
        icon: 'size-10 max-[40rem]:size-11',
        'icon-sm': 'size-9 max-[40rem]:size-11',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** §8.4 — shows a spinner, hides the label, holds width, blocks input */
    loading?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const isIconOnly = size === 'icon' || size === 'icon-sm' || size === 'icon-lg'

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="size-4" />
          {/* The label stays in the tree so the button does not resize */}
          <span
            className={cn(
              isIconOnly ? 'sr-only' : 'truncate',
              loading && 'opacity-0',
            )}
          >
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps }
