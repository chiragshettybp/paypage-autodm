'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

/**
 * Light is the only mode (§31.2), so the Toaster is not theme-aware.
 * §15.1: bottom-right stack, 24px radius, overlay surface, overlay shadow.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      visibleToasts={4}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group flex items-start gap-2.5 w-full rounded-3xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_2px_8px_0_#0000000f,0_-6px_12px_0_#00000008,0_14px_28px_0_#00000014]',
          title: 'text-sm font-medium leading-5',
          description: 'text-xs leading-4 text-muted-foreground',
          actionButton:
            'bg-primary text-primary-foreground rounded-3xl px-3 h-8 text-xs font-medium transition-standard',
          cancelButton:
            'bg-secondary text-secondary-foreground rounded-3xl px-3 h-8 text-xs font-medium transition-standard',
          closeButton:
            'bg-popover border border-border rounded-full size-6 text-muted-foreground hover:text-foreground transition-standard',
          error: '[&_[data-icon]]:text-destructive',
          success: '[&_[data-icon]]:text-success',
          warning: '[&_[data-icon]]:text-warning',
          info: '[&_[data-icon]]:text-foreground',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
