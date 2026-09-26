'use client'

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  House,
  MessagesSquare,
  Settings2,
  Sparkles,
  Workflow,
  ExternalLink,
} from 'lucide-react'

/**
 * §12.2 — Single source of truth for navigation.
 *
 * The sidebar, the mobile bottom nav, and the More sheet all read from here,
 * so a new route cannot appear in one surface and be missing from another.
 *
 * `mobilePrimary` marks the four items promoted into the bottom bar; everything
 * else lives behind More. The split is fixed by the spec at 4 + More.
 */

export interface NavItem {
  href: string
  label: string
  /** Shorter label for the bottom bar, where horizontal space is scarce. */
  shortLabel?: string
  icon: LucideIcon
  description?: string
  /** Shown in the mobile bottom nav as one of the four primary items. */
  mobilePrimary?: boolean
  /** Whether this is an external link (opens in same tab) */
  external?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: House,
    description: 'Overview and quick actions',
    mobilePrimary: true,
  },
  {
    href: '/dashboard/automations',
    label: 'Auto replies',
    shortLabel: 'Automations',
    icon: Workflow,
    description: 'Keyword rules and triggers',
    mobilePrimary: true,
  },
  {
    href: '/dashboard/inbox',
    label: 'Conversations',
    shortLabel: 'Inbox',
    icon: MessagesSquare,
    description: 'Replies sent to your audience',
    mobilePrimary: true,
  },
  {
    href: '/dashboard/ice-breakers',
    label: 'Starters',
    shortLabel: 'Starters',
    icon: Sparkles,
    description: 'Reusable conversation openers',
    mobilePrimary: true,
  },
  {
    href: '/dashboard/analytics',
    label: 'Insights',
    icon: BarChart3,
    description: 'Reach and engagement over time',
  },
  {
    href: '/dashboard/settings',
    label: 'Preferences',
    shortLabel: 'Settings',
    icon: Settings2,
    description: 'Assistant tone and account',
  },
  {
    href: 'https://paypageapp.vercel.app/dashboard',
    label: 'Go back to PayPage Dashboard',
    shortLabel: 'PayPage',
    icon: ExternalLink,
    description: 'Return to PayPage Dashboard',
    external: true,
  },
] as const

export const MOBILE_PRIMARY_NAV: readonly NavItem[] = NAV_ITEMS.filter(
  (item) => item.mobilePrimary,
)

export const MOBILE_SECONDARY_NAV: readonly NavItem[] = NAV_ITEMS.filter(
  (item) => !item.mobilePrimary,
)

export const SUPPORT_LINK = {
  href: 'https://t.me/instagramautomationp8',
  label: 'Help and support',
} as const

/**
 * Exact match for the dashboard root, prefix match for everything else, so
 * `/dashboard` never lights up while you are on `/dashboard/inbox`.
 */
export function isNavItemActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}
