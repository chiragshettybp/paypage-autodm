'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/logo'

/**
 * §12.2 — Sticky 64px header, blurred.
 *
 * Present only below 1024px. On desktop the sidebar already carries the
 * wordmark and the account, and each page opens with its own PageHeader, so a
 * persistent bar there would either be empty or repeat the page title. This
 * header is what mobile would otherwise be missing.
 *
 * The bottom hairline only appears once the page has scrolled, so the bar
 * reads as one surface with the content at rest.
 */
export function AppHeader({ className, ...props }: React.ComponentProps<'header'>) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-slot="app-header"
      className={cn(
        'sticky top-0 z-40 h-16 shrink-0 min-[64rem]:hidden',
        'border-b bg-background/80 backdrop-blur-xl',
        'transition-[border-color] duration-[var(--motion-normal)]',
        scrolled ? 'border-separator' : 'border-transparent',
        className,
      )}
      {...props}
    >
      <div className="flex h-full items-center px-4 sm:px-6">
        <Logo href="/dashboard" />
      </div>
    </header>
  )
}
