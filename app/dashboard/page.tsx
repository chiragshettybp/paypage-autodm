'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  MessageSquareIcon,
  MessagesSquareIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
  WorkflowIcon,
} from 'lucide-react'

import { useInstagramSession } from '@/hooks/use-instagram-session'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/shared/eyebrow'
import { StatCard } from '@/components/shared/stat-card'
import { StatusPill } from '@/components/shared/status-pill'
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  StatCardSkeleton,
} from '@/components/shared/states'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderText,
  PageHeaderTitle,
} from '@/components/shared/page-header'

interface DashboardStats {
  metrics: {
    totalAutomations: number
    activeTriggers: number
    audienceReached: number
    messagesSent: number
  }
  recentActivity: Array<{
    id: string
    content: string
    created_at: string
    recipient?: { recipient_username: string }
  }>
}

export default function DashboardPage() {
  const { username, userId, isLoading: sessionLoading } = useInstagramSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`/api/dashboard/stats?userId=${userId}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        return response.json()
      })
      .then((data) => {
        if (data?.error) throw new Error(data.error)
        setStats(data)
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  if (sessionLoading) {
    return <DashboardSkeleton />
  }

  const metrics = stats?.metrics
  const activity = stats?.recentActivity ?? []
  const firstName = username ? username.split(/[._-]/)[0] : null

  return (
    <div className="section-stack">
      <PageHeader>
        <PageHeaderText>
          <Eyebrow>Overview</Eyebrow>
          <PageHeaderTitle>
            {firstName ? `Welcome back, ${firstName}` : 'Your workspace'}
          </PageHeaderTitle>
          <PageHeaderDescription>
            Everything your automations have sent, in one place.
          </PageHeaderDescription>
        </PageHeaderText>
        <PageHeaderActions>
          <Button asChild>
            <Link href="/dashboard/automations">
              <PlusIcon className="size-4" aria-hidden="true" />
              New automation
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {error !== null && (
        <ErrorState
          title="Could not load your numbers"
          description="The dashboard could not reach the server. Your automations are unaffected."
          error={error}
          onRetry={load}
        />
      )}

      <section
        aria-label="Account summary"
        className="grid grid-cols-2 gap-3 min-[64rem]:grid-cols-4"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : [
              {
                label: 'Automations',
                value: metrics?.totalAutomations ?? 0,
                icon: WorkflowIcon,
              },
              {
                label: 'Active triggers',
                value: metrics?.activeTriggers ?? 0,
                icon: CheckCircle2Icon,
              },
              {
                label: 'Messages sent',
                value: metrics?.messagesSent ?? 0,
                icon: MessageSquareIcon,
              },
              {
                label: 'People reached',
                value: metrics?.audienceReached ?? 0,
                icon: UsersIcon,
              },
            ].map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.value.toLocaleString()}
                icon={item.icon}
              />
            ))}
      </section>

      <div className="grid gap-4 min-[64rem]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="card card-none overflow-hidden" aria-labelledby="recent-heading">
          <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="min-w-0">
              <h2
                id="recent-heading"
                className="text-base font-semibold leading-6"
              >
                Recent conversations
              </h2>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                The latest replies your automations sent.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/dashboard/inbox">
                View all
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="border-t border-separator">
            {loading ? (
              <ListSkeleton count={4} className="p-3" />
            ) : activity.length > 0 ? (
              <ul className="flex flex-col divide-y divide-separator">
                {activity.slice(0, 6).map((message) => (
                  <li key={message.id}>
                    <Link
                      href="/dashboard/inbox"
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-secondary sm:px-5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground">
                        <MessageSquareIcon
                          className="size-4"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-5">
                          @{message.recipient?.recipient_username || 'instagram_user'}
                        </p>
                        <p className="mt-0.5 truncate text-sm leading-5 text-muted-foreground">
                          {message.content}
                        </p>
                      </div>
                      <time
                        dateTime={message.created_at}
                        className="shrink-0 text-xs leading-4 text-muted-foreground tabular-nums"
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<MessagesSquareIcon />}
                title="No conversations yet"
                description="Replies sent by your automations will appear here."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/automations">
                      Create your first automation
                    </Link>
                  </Button>
                }
                className="m-3 min-h-0 border-0 sm:m-4"
              />
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className="card" aria-labelledby="status-heading">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                <SparklesIcon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2
                  id="status-heading"
                  className="text-base font-semibold leading-6"
                >
                  Account status
                </h2>
                <p className="text-sm leading-5 text-muted-foreground">
                  {username ? `@${username}` : 'Not connected'}
                </p>
              </div>
            </div>

            <dl className="mt-1 flex flex-col gap-2.5 border-t border-separator pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Instagram</dt>
                <dd>
                  <StatusPill tone="live">Connected</StatusPill>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Running automations</dt>
                <dd className="font-medium tabular-nums">
                  {metrics?.activeTriggers ?? 0}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card bg-primary text-primary-foreground">
            <h2 className="text-base font-semibold leading-6">
              Build your next automation
            </h2>
            <p className="mt-1.5 text-sm leading-5 text-primary-foreground/75">
              Turn a comment, direct message, or story reply into an automatic
              response.
            </p>
            <Button
              asChild
              size="sm"
              className={cn('mt-4 self-start', 'bg-primary-foreground text-primary')}
            >
              <Link href="/dashboard/automations">
                Open the builder
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </section>
        </aside>
      </div>
    </div>
  )
}

/**
 * The shell already renders a session loader, so this only covers the stats
 * request. Mirrors the real layout closely enough that nothing jumps when the
 * data lands.
 */
function DashboardSkeleton() {
  return (
    <div className="section-stack" aria-busy="true">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-20 rounded-sm skeleton-wash animate-pulse" />
        <div className="h-8 w-64 rounded-sm skeleton-wash animate-pulse" />
        <div className="h-5 w-80 max-w-full rounded-sm skeleton-wash animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3 min-[64rem]:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 min-[64rem]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="card card-none overflow-hidden">
          <div className="flex flex-col gap-2 p-5">
            <div className="h-6 w-48 rounded-sm skeleton-wash animate-pulse" />
            <div className="h-5 w-72 max-w-full rounded-sm skeleton-wash animate-pulse" />
          </div>
          <div className="border-t border-separator p-3">
            <ListSkeleton count={4} />
          </div>
        </div>
        <div className="card">
          <div className="h-6 w-40 rounded-sm skeleton-wash animate-pulse" />
          <div className="h-5 w-24 rounded-sm skeleton-wash animate-pulse" />
        </div>
      </div>
    </div>
  )
}
