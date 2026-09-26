'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * §12.8 — Modal. 24px radius, 16px base padding, --overlay-shadow.
 * On narrow screens it docks to the bottom edge so the primary action stays
 * reachable above the keyboard (§20.4).
 */

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=open]:duration-[var(--motion-normal)]',
        'data-[state=closed]:duration-[var(--motion-fast)]',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-popover p-4 sm:p-6',
          'shadow-[var(--overlay-shadow)]',
          'max-[40rem]:inset-x-0 max-[40rem]:bottom-0 max-[40rem]:top-auto',
          'max-[40rem]:max-h-[90dvh] max-[40rem]:w-full max-[40rem]:rounded-t-3xl',
          'max-[40rem]:pb-[max(1rem,env(safe-area-inset-bottom))]',
          'min-[40rem]:top-1/2 min-[40rem]:left-1/2 min-[40rem]:bottom-auto',
          'min-[40rem]:w-full min-[40rem]:max-w-lg min-[40rem]:-translate-x-1/2 min-[40rem]:-translate-y-1/2 min-[40rem]:rounded-3xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'min-[40rem]:data-[state=open]:zoom-in-95 min-[40rem]:data-[state=closed]:zoom-out-95',
          'max-[40rem]:data-[state=open]:slide-in-from-bottom max-[40rem]:data-[state=closed]:slide-out-to-bottom',
          'data-[state=open]:duration-[var(--motion-normal)]',
          'data-[state=closed]:duration-[var(--motion-fast)]',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            className={cn(
              'absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-xl',
              'text-muted-foreground transition-standard',
              'hover:bg-surface-secondary hover:text-foreground',
              'max-[40rem]:size-11',
            )}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 pr-8 text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // Stacked on mobile so both actions are full-width and 44px tall
        'mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-xl font-semibold leading-7', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
