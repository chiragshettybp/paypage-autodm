'use client'

import * as React from 'react'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

/**
 * §10.4 — Token list. Enter or comma commits, Backspace on an empty field
 * removes the last chip, and blur commits anything typed but not submitted.
 *
 * Keywords are matched case-insensitively on the backend, so chips are
 * normalised to lowercase and de-duplicated that way. Free-text chip lists —
 * the public comment rotation — must keep their capitalisation, so
 * `preserveCase` turns that off.
 */
export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  /** Wired to the inner field so the label can point at something focusable. */
  id?: string
  max?: number
  preserveCase?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function TagInput({
  value,
  onChange,
  placeholder,
  className,
  id,
  max,
  preserveCase = false,
  ...aria
}: TagInputProps) {
  const [draft, setDraft] = React.useState('')

  const atLimit = typeof max === 'number' && value.length >= max

  const normalise = React.useCallback(
    (raw: string) => (preserveCase ? raw.trim() : raw.trim().toLowerCase()),
    [preserveCase],
  )

  const add = React.useCallback(() => {
    if (atLimit) return
    const next = normalise(draft)
    if (!next) return
    const alreadyThere = value.some(
      (tag) => tag.toLowerCase() === next.toLowerCase(),
    )
    if (!alreadyThere) onChange([...value, next])
    setDraft('')
  }, [atLimit, draft, normalise, onChange, value])

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <div
      data-slot="tag-input"
      className={cn(
        'flex min-h-9 w-full flex-wrap items-center gap-2 rounded-lg',
        'bg-field-background px-2 py-2 shadow-xs',
        'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring',
        className,
      )}
      onClick={(event) => {
        // Clicking the padding should focus the field, not just place a caret.
        const target = event.target as HTMLElement
        if (target === event.currentTarget) {
          event.currentTarget.querySelector('input')?.focus()
        }
      }}
    >
      {value.map((tag, index) => (
        <Badge key={`${tag}-${index}`} variant="accent" className="gap-1 pr-1">
          <span className="max-w-[16rem] truncate">{tag}</span>
          <button
            type="button"
            onClick={() => remove(index)}
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-60 transition-standard hover:bg-foreground/10 hover:opacity-100"
          >
            <XIcon className="size-3" aria-hidden="true" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={draft}
        disabled={atLimit}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            add()
          } else if (event.key === 'Backspace' && !draft && value.length > 0) {
            remove(value.length - 1)
          }
        }}
        onBlur={add}
        placeholder={
          atLimit ? undefined : value.length === 0 ? placeholder : undefined
        }
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        className="h-6 min-w-[8rem] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  )
}

export { TagInput }
