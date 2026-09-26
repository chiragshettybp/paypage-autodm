'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { useInstagramSession } from '@/hooks/use-instagram-session'
import { FullPageLoader } from '@/components/shared/states'

/**
 * §13 — App shell.
 *
 * Desktop (≥1024px): fixed 256px sidebar, content measured to 1152px.
 * Below 1024px: 64px sticky blurred header, bottom nav, and `.shell-main`'s
 * 112px bottom reservation.
 *
 * The scroll container is the document, not a nested `overflow-auto` div, so
 * sticky positioning and the header's scroll listener work normally.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { username, profilePic, logout, isLoading } = useInstagramSession()

  if (isLoading) {
    return (
      <FullPageLoader
        className="min-h-dvh"
        label="Connecting to Instagram"
      />
    )
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-40 hidden min-[64rem]:block">
        <Sidebar
          username={username ?? undefined}
          profilePic={profilePic}
          onLogout={logout}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col min-[64rem]:pl-64">
        <AppHeader />
        <main data-slot="shell-main-container" className="flex-1">
          <div className="shell-main">{children}</div>
        </main>
      </div>

      <MobileNav
        username={username ?? undefined}
        profilePic={profilePic}
        onLogout={logout}
      />
    </div>
  )
}
