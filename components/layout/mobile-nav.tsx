'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLinkIcon, LifeBuoyIcon, LogOutIcon, MoreHorizontalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  MOBILE_PRIMARY_NAV,
  MOBILE_SECONDARY_NAV,
  SUPPORT_LINK,
  isNavItemActive,
} from '@/components/layout/nav-config'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

/**
 * §12.3 — Mobile bottom navigation. Four primary destinations plus More.
 * 64px tall, always present below 1024px, blurred, and cleared of the home
 * indicator. `.shell-main` reserves 112px of bottom padding so the last row of
 * content is never trapped underneath it.
 *
 * There is no left drawer any more: five destinations do not fit a drawer
 * legibly, and the bottom bar is the direct-thumb target. A drawer would be a
 * second navigation model for the same routes.
 */

export function MobileNav({
  username,
  profilePic,
  onLogout,
}: {
  username?: string
  profilePic?: string | null
  onLogout?: () => void
}) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = React.useState(false)

  // Close the sheet whenever the route changes, so a tap never leaves it open
  // over the page the user just asked for.
  React.useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  // A More item is "current" when any non-primary route is active, so the
  // highlight never disappears entirely while browsing Insights or Settings.
  const moreActive = MOBILE_SECONDARY_NAV.some((item) =>
    isNavItemActive(pathname, item.href),
  )

  return (
    <>
      <nav
        data-slot="mobile-nav"
        aria-label="Dashboard"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 min-[64rem]:hidden',
          'border-t border-separator bg-card/80 backdrop-blur-xl',
          'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <ul className="grid grid-cols-5">
          {MOBILE_PRIMARY_NAV.map((item) => {
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
                    className={cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2',
                      'text-muted-foreground transition-standard',
                      'hover:bg-surface-secondary hover:text-foreground',
                      'active:scale-[0.99]',
                      active && 'text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 items-center',
                        active && 'text-accent-soft-foreground',
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        'max-w-full truncate text-xs font-medium leading-4',
                        active && 'font-semibold',
                      )}
                    >
                      {item.shortLabel ?? item.label}
                    </span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2',
                      'text-muted-foreground transition-standard',
                      'hover:bg-surface-secondary hover:text-foreground',
                      'active:scale-[0.99]',
                      active && 'text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 items-center',
                        active && 'text-accent-soft-foreground',
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        'max-w-full truncate text-xs font-medium leading-4',
                        active && 'font-semibold',
                      )}
                    >
                      {item.shortLabel ?? item.label}
                    </span>
                  </Link>
                )}
              </li>
            )
          })}

          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-current={moreActive ? 'page' : undefined}
              className={cn(
                'flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 py-2',
                'text-muted-foreground transition-standard',
                'hover:bg-surface-secondary hover:text-foreground',
                'active:scale-[0.99]',
                moreActive && 'text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-6 items-center',
                  moreActive && 'text-accent-soft-foreground',
                )}
              >
                <MoreHorizontalIcon className="size-5 shrink-0" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  'text-xs font-medium leading-4',
                  moreActive && 'font-semibold',
                )}
              >
                More
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh]">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
            <SheetDescription>
              The rest of your workspace and account controls.
            </SheetDescription>
          </SheetHeader>

          <div className="scroll-contain flex flex-col gap-1 overflow-y-auto px-6 pb-2">
            {MOBILE_SECONDARY_NAV.map((item) => {
              const active = isNavItemActive(pathname, item.href)
              const Icon = item.icon
              const isExternal = item.external === true
              return isExternal ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_self"
                  rel="noopener noreferrer"
                  aria-current={active ? 'page' : undefined}
                  className="nav-item"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{item.label}</span>
                    {item.description && (
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="nav-item"
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{item.label}</span>
                    {item.description && (
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}

            <div className="my-2 h-px bg-separator" role="presentation" />

            <a
              href={SUPPORT_LINK.href}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
            >
              <LifeBuoyIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{SUPPORT_LINK.label}</span>
              <ExternalLinkIcon
                className="ml-auto size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </a>
          </div>

          {username && (
            <div className="border-t border-separator px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePic}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-5">{username}</p>
                  <p className="truncate text-xs leading-4 text-muted-foreground">
                    Instagram connected
                  </p>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="press-subtle flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium text-destructive transition-standard hover:bg-danger-soft"
                  >
                    <LogOutIcon className="size-4 shrink-0" aria-hidden="true" />
                    Log out
                  </button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
