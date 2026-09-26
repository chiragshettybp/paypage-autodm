'use client'

import { useCallback, useEffect, useState } from 'react'
import { BrainIcon, CheckIcon, ChevronDownIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusPill } from '@/components/shared/status-pill'
import { FormField, TextareaField } from '@/components/shared/form-field'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * §10.2 / §18.7 — AI assistant settings.
 *
 * The enable switch writes immediately on its own; the configuration panel is
 * a separate, explicit save. Mixing the two would mean toggling the feature
 * silently discards half-typed config.
 */
export function AssistantSettings({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [open, setOpen] = useState(false)
  const [context, setContext] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [revealKey, setRevealKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`/api/groq/auto-reply?userId=${userId}`)
      if (!response.ok) throw new Error('Could not load assistant settings.')
      const data = await response.json()
      setEnabled(data.enabled ?? false)
      setContext(data.ai_context ?? '')
      setHasApiKey(data.has_api_key ?? false)
      setBaseUrl(data.ai_base_url ?? '')
      setModel(data.ai_model ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load settings.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleToggle(next: boolean) {
    if (toggling) return
    setToggling(true)
    setError(null)
    // Optimistic: the switch must feel instant. Reverted if the write fails.
    setEnabled(next)
    try {
      const response = await fetch('/api/groq/auto-reply', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: next }),
      })
      if (!response.ok) throw new Error('Could not change that setting.')
    } catch (err) {
      setEnabled(!next)
      setError(err instanceof Error ? err.message : 'Could not change that setting.')
    } finally {
      setToggling(false)
    }
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/groq/auto-reply', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          enabled,
          ai_context: context,
          ai_base_url: baseUrl,
          ai_model: model,
          // Only send the key when a new one was typed, so an empty field
          // never wipes the stored key
          ...(apiKey !== '' ? { groq_api_key: apiKey } : {}),
        }),
      })
      if (!response.ok) throw new Error('Could not save your settings.')
      if (apiKey) {
        setHasApiKey(true)
        setApiKey('')
        setRevealKey(false)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="card" aria-busy="true">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 max-w-full" />
      </section>
    )
  }

  return (
    <section className="card" aria-labelledby="assistant-heading">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
            <BrainIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="assistant-heading"
                className="text-base font-semibold leading-6"
              >
                AI assistant
              </h2>
              <StatusPill tone={enabled ? 'live' : 'neutral'}>
                {enabled ? 'On' : 'Off'}
              </StatusPill>
            </div>
            <p className="text-sm leading-5 text-muted-foreground">
              Let the assistant write replies that sound like you.
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          disabled={toggling}
          onCheckedChange={(next) => void handleToggle(next)}
          aria-label="Enable the AI assistant"
          className="mt-1 shrink-0"
        />
      </div>

      <div className="border-t border-separator pt-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="assistant-config"
          className="press-subtle -mx-1 flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1 text-left"
        >
          <span className="text-sm font-semibold">Configure assistant</span>
          <ChevronDownIcon
            className={cn('chevron-rotate size-4 shrink-0 text-muted-foreground')}
            data-open={open || undefined}
            aria-hidden="true"
          />
        </button>

        <div
          id="assistant-config"
          data-open={open}
          className="expand-animated"
          {...(!open ? { inert: true } : {})}
        >
          <div>
            <div className="flex flex-col gap-4 pt-4">
              <FormField
                id="assistant-key"
                label="API key"
                description="Stored on the server and never sent back to the browser."
                type={revealKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={hasApiKey ? 'Enter a new key to replace it' : 'gsk_…'}
                autoComplete="off"
                spellCheck={false}
                inputClassName="font-mono"
                action={
                  <div className="flex items-center gap-2">
                    {hasApiKey && !apiKey && (
                      <StatusPill tone="live" dot={false}>
                        Key saved
                      </StatusPill>
                    )}
                    <button
                      type="button"
                      onClick={() => setRevealKey((v) => !v)}
                      aria-label={revealKey ? 'Hide API key' : 'Show API key'}
                      className="press-subtle flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-standard hover:bg-surface-secondary hover:text-foreground"
                    >
                      {revealKey ? (
                        <EyeOffIcon className="size-4" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                }
              />

              <FormField
                id="assistant-base-url"
                label="API base URL"
                description="Optional. Any OpenAI-compatible endpoint works — Groq, OpenAI, Together, or your own proxy."
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="https://api.groq.com/v1"
                autoComplete="off"
                spellCheck={false}
                inputClassName="font-mono"
              />

              <FormField
                id="assistant-model"
                label="Model"
                description="Optional. Defaults to the provider's recommended model."
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="llama-3.1-8b-instant"
                autoComplete="off"
                spellCheck={false}
                inputClassName="font-mono"
              />

              <TextareaField
                id="assistant-context"
                label="Personality and context"
                description="Your niche, products, tone, and anything the assistant should never say. This is sent with every request, so leave anything confidential out."
                value={context}
                onChange={(event) => setContext(event.target.value)}
                rows={5}
                placeholder="e.g. This is a fitness coaching account. I sell online training programs. My tone is motivating but calm. If someone asks about pricing, point them to a free consultation."
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={() => void handleSave()} loading={saving}>
                  {saved ? 'Saved' : 'Save settings'}
                </Button>
                {saved && (
                  <span
                    role="status"
                    className="check-pop inline-flex items-center gap-1.5 text-sm text-success-soft-foreground"
                  >
                    <CheckIcon className="size-4" aria-hidden="true" />
                    Saved
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
