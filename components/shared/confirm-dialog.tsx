'use client'

import * as React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * §17.5 — Confirmation. Every destructive action in the app routes through
 * this component so there is exactly one confirmation shape: what will
 * happen, which item, and an explicit confirm/cancel pair.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  onConfirm,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'destructive' | 'primary'
  onConfirm: () => void | Promise<void>
  children?: React.ReactNode
}) {
  const [busy, setBusy] = React.useState(false)

  // The dialog can be dismissed by Escape or the overlay while a confirm is in
  // flight; that would leave the caller's state assuming success.
  const handleOpenChange = (next: boolean) => {
    if (busy) return
    onOpenChange(next)
  }

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          {confirmVariant === 'destructive' ? (
            <AlertDialogAction disabled={busy} onClick={handleConfirm}>
              {busy ? 'Working…' : confirmLabel}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault()
                void handleConfirm()
              }}
            >
              {busy ? 'Working…' : confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
