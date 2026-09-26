'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLinkIcon, LogOutIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/logo'
import { NAV_ITEMS, SUPPORT_LINK, isNavItemActive } from '@/components/layout/nav-config'

/**
 * §12.2 — Desktop sidebar, 256px, fixed, not collapsible.
 *
 * The 72px collapsed mode is gone: it is not in the spec, and it made the
 * active item's label unavailable. The whole nav fits in 256px without
 * truncation, so a toggle would only add state.
 */
export function Sidebar({
  className,
  username,
  profilePic,
  onLogout,
  onNavigate,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  username?: string
  profilePic?: string | null
  onLogout?: () => void
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <aside
      data-slot="sidebar"
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-separator bg-card',
        className,
      )}
      {...props}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-separator px-4">
        <Logo href="/dashboard" onClick={onNavigate} />
      </div>

      <nav
        className="scroll-contain flex-1 overflow-y-auto p-3"
        aria-label="Dashboard"
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href)
            const Icon = item.icon
            const isExternal = item.external === true
            return (
              <li key={item.href}>
                {isExternal ? (
                  <a
                    href={item.href}
                    target="_self"
                    rel="noopener noreferrer"
                    aria-current={active ? 'page' : undefined}
                    className="nav-item"
                    data-active={active || undefined}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className="nav-item"
                    data-active={active || undefined}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        <div className="my-4 h-px bg-separator" role="presentation" />

        <a
          href={SUPPORT_LINK.href}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
        >
          <ExternalLinkIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{SUPPORT_LINK.label}</span>
        </a>
      </nav>

      <div className="shrink-0 border-t border-separator p-3">
        <div className="flex items-center gap-2.5 rounded-xl p-2">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePic}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              (username ?? '?').charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-5">
              {username ?? 'Account'}
            </p>
            <p className="truncate text-xs leading-4 text-muted-foreground">
              Instagram connected
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
              className="press-subtle -mr-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-standard hover:bg-danger-soft hover:text-destructive max-[40rem]:size-11"
            >
              <LogOutIcon className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
