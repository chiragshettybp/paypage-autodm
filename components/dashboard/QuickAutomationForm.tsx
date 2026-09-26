'use client'

import { useRef, useState } from 'react'
import { CheckIcon, SparklesIcon } from 'lucide-react'

import type { Automation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/shared/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Source = Automation['trigger_source']

const SOURCE_OPTIONS: ReadonlyArray<{ value: Source; label: string; hint: string }> = [
  {
    value: 'dm',
    label: 'Direct messages',
    hint: 'Matches keywords in incoming DMs',
  },
  {
    value: 'comment',
    label: 'Post comments',
    hint: 'Any post or reel · reply sent by DM',
  },
  {
    value: 'story',
    label: 'Story replies',
    hint: 'Matches keywords in story replies',
  },
]

/**
 * The one-field-takes-a-whole-page fast path. Everything here is deliberately
 * optional-free: a keyword and an answer is the smallest useful automation,
 * so the form refuses to submit until both are present.
 */
export function QuickAutomationForm({
  userId,
  initialSource,
  onSuccess,
}: {
  userId: string
  initialSource: Source
  onSuccess: (source: Source) => void
}) {
  const [source, setSource] = useState<Source>(initialSource)
  const [keyword, setKeyword] = useState('')
  const [answer, setAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const [answerError, setAnswerError] = useState<string | null>(null)
  // Guards against a double submit from a fast double-tap
  const submitting = useRef(false)

  const hint = SOURCE_OPTIONS.find((o) => o.value === source)?.hint ?? ''
  const canSubmit = keyword.trim().length > 0 && answer.trim().length > 0

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    const trimmedKeyword = keyword.trim()
    const trimmedAnswer = answer.trim()
    const nextKeywordError = trimmedKeyword ? null : 'Enter the keyword to match.'
    const nextAnswerError = trimmedAnswer ? null : 'Enter the reply to send.'
    setKeywordError(nextKeywordError)
    setAnswerError(nextAnswerError)
    if (nextKeywordError || nextAnswerError) return

    submitting.current = true
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: `Reply to ${trimmedKeyword}`,
          trigger_source: source,
          trigger_type: source === 'story' ? 'reply' : 'keyword',
          trigger_value: trimmedKeyword,
          content: {
            message: trimmedAnswer,
            ...(source === 'comment' ? { reply_mode: 'dm_only' } : {}),
          },
          specific_media_id: null,
        }),
      })
      if (!response.ok) throw new Error('Could not save.')
      setKeyword('')
      setAnswer('')
      setKeywordError(null)
      setAnswerError(null)
      onSuccess(source)
    } catch {
      setError(
        'Could not save this reply. Check your connection and try again.',
      )
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} noValidate className="card card-none overflow-hidden">
      <fieldset disabled={saving} className="flex min-w-0 flex-col">
        {/* Source picker sits on its own row above the two text fields so the
            grid below never has to reflow when it changes. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-separator px-4 py-3">
          <label
            htmlFor="quick-source"
            className="text-sm font-semibold leading-5"
          >
            Reply to
          </label>
          <select
            id="quick-source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value as Source)
              setError(null)
            }}
            className="select h-9 w-auto max-w-full text-sm"
          >
            {SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid min-[40rem]:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-2 border-b border-separator p-4 min-[40rem]:border-b-0 min-[40rem]:border-r">
            <FieldLabel id="quick-keyword">When they say</FieldLabel>
            <input
              required
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value)
                if (keywordError) setKeywordError(null)
              }}
              placeholder="e.g. price"
              aria-invalid={keywordError ? true : undefined}
              aria-describedby={keywordError ? 'quick-keyword-error' : undefined}
              autoComplete="off"
              className="input"
            />
            <p
              id="quick-keyword-error"
              role={keywordError ? 'alert' : undefined}
              className="field-error-reserve text-sm leading-4 text-destructive"
            >
              {keywordError}
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <FieldLabel id="quick-answer">Send this reply</FieldLabel>
              <span className="text-xs leading-4 text-muted-foreground tabular-nums">
                {answer.length}/1000
              </span>
            </div>
            <textarea
              required
              maxLength={1000}
              rows={3}
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value)
                if (answerError) setAnswerError(null)
              }}
              placeholder="Our plans start at ₹499. Here’s the link →"
              aria-invalid={answerError ? true : undefined}
              aria-describedby={
                answerError ? 'quick-answer-error' : undefined
              }
              className="input textarea"
            />
            <p
              id="quick-answer-error"
              role={answerError ? 'alert' : undefined}
              className="field-error-reserve text-sm leading-4 text-destructive"
            >
              {answerError}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-separator px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-5 text-muted-foreground">{hint}</p>
          <Button
            type="submit"
            loading={saving}
            disabled={!canSubmit}
            className="shrink-0 self-end sm:self-auto"
          >
            {!saving && <SparklesIcon className="size-4" aria-hidden="true" />}
            {saving ? 'Saving' : 'Save reply'}
          </Button>
        </div>

        {error && (
          <div className="px-4 pb-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </fieldset>
    </form>
  )
}

/** Shown by the page for a moment after a successful quick save. */
export function QuickAutomationSavedNotice({ source }: { source: Source }) {
  const label =
    SOURCE_OPTIONS.find((o) => o.value === source)?.label.toLowerCase() ??
    'automation'
  return (
    <p
      role="status"
      className="notice-in flex items-center gap-2 text-sm text-muted-foreground"
    >
      <CheckIcon className="size-4 shrink-0 text-success" aria-hidden="true" />
      Saved and live. It will now reply to matching {label}.
    </p>
  )
}
