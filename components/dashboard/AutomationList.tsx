'use client'

import * as React from 'react'
import {
  ImageIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react'

import type { Automation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/shared/status-pill'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/states'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const SOURCE_LABEL: Record<Automation['trigger_source'], string> = {
  dm: 'Direct message',
  comment: 'Post comment',
  story: 'Story reply',
}

/** The reply a row previews, preferring the free-text message. */
function previewOf(rule: Automation) {
  const content = rule.response_content
  return content?.message || content?.card?.title || rule.name
}

/**
 * §14 — Automation list. One row per automation, 12px radius, 1px separator.
 *
 * The row is a plain block, not a card: it is part of a single surface, and
 * per-row borders would read as a stack of unrelated cards. On mobile the
 * actions collapse into a single menu so the text keeps the full width.
 */
export function AutomationList({
  rules,
  busyId,
  onToggle,
  onEdit,
  onDelete,
}: {
  rules: Automation[]
  /** Id currently being patched, so only that row shows a busy state. */
  busyId: string | null
  onToggle: (rule: Automation) => void
  onEdit: (rule: Automation) => void
  onDelete: (rule: Automation) => void
}) {
  const [pendingDelete, setPendingDelete] = React.useState<Automation | null>(null)

  if (rules.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquareIcon />}
        title="No replies yet"
        description="Add your first keyword and answer above, and it will appear here."
        className="min-h-0"
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-separator">
        {rules.map((rule) => {
          const busy = busyId === rule.id
          const preview = previewOf(rule)

          return (
            <li
              key={rule.id}
              className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-3 py-4',
                'min-[40rem]:flex-nowrap',
                busy && 'opacity-60',
              )}
            >
              <div className="min-w-0 flex-1 basis-64">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold leading-5">
                    {rule.trigger_value}
                  </p>
                  {rule.specific_media_id && (
                    <span className="inline-flex items-center gap-1 text-xs leading-4 text-muted-foreground">
                      <ImageIcon className="size-3.5 shrink-0" aria-hidden="true" />
                      Selected post
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {preview}
                </p>
                <p className="mt-1.5 text-xs leading-4 text-muted-foreground">
                  {SOURCE_LABEL[rule.trigger_source] ?? rule.trigger_source}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <StatusPill tone={rule.is_active ? 'live' : 'neutral'}>
                  {rule.is_active ? 'Active' : 'Paused'}
                </StatusPill>

                {/* Row actions. The switch is the primary control and stays
                    visible at every width; the rest live in a menu. */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={busy}
                  aria-label={`${rule.is_active ? 'Pause' : 'Activate'} ${rule.name}`}
                  aria-pressed={rule.is_active}
                  title={rule.is_active ? 'Pause' : 'Activate'}
                  onClick={() => onToggle(rule)}
                  className="max-[40rem]:size-11"
                >
                  {rule.is_active ? (
                    <PauseIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <PlayIcon className="size-4" aria-hidden="true" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      aria-label={`More actions for ${rule.name}`}
                      className="max-[40rem]:size-11"
                    >
                      <MoreHorizontalIcon
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(rule)}>
                      <PencilIcon className="size-4" aria-hidden="true" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setPendingDelete(rule)}
                    >
                      <Trash2Icon className="size-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete this reply?"
        description={
          pendingDelete ? (
            <>
              Anyone who sends{' '}
              <span className="font-semibold text-foreground">
                &ldquo;{pendingDelete.trigger_value}&rdquo;
              </span>{' '}
              will stop getting an automatic reply. This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete reply"
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete)
        }}
      />
    </>
  )
}

/** Search field above the list. Kept separate so the page owns the query. */
export function AutomationSearch({
  value,
  onChange,
  resultCount,
}: {
  value: string
  onChange: (value: string) => void
  resultCount: number
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="search"
        aria-label="Search replies"
        placeholder="Find a keyword…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input h-9 w-44 max-w-full text-sm sm:w-56"
      />
      {value.trim().length > 0 && (
        <span className="shrink-0 text-xs leading-4 text-muted-foreground tabular-nums">
          {resultCount} {resultCount === 1 ? 'match' : 'matches'}
        </span>
      )}
    </div>
  )
}
