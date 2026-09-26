'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'

import { useInstagramSession } from '@/hooks/use-instagram-session'
import type { Automation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eyebrow } from '@/components/shared/eyebrow'
import { ListSkeleton } from '@/components/shared/states'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderText,
  PageHeaderTitle,
} from '@/components/shared/page-header'
import {
  AutomationList,
  AutomationSearch,
} from '@/components/dashboard/AutomationList'
import {
  QuickAutomationForm,
  QuickAutomationSavedNotice,
} from '@/components/dashboard/QuickAutomationForm'
import { AssistantSettings } from '@/components/dashboard/AssistantSettings'
import { CreateRuleForm } from '@/components/dashboard/CreateRuleForm'

export default function AutomationsPage() {
  const { userId, isLoading: sessionLoading } = useInstagramSession()
  const [rules, setRules] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [edit, setEdit] = useState<Automation | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [savedSource, setSavedSource] = useState<Automation['trigger_source'] | null>(
    null,
  )

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`/api/automations?userId=${userId}`)
      const data = await response.json()
      if (!response.ok || !Array.isArray(data)) {
        throw new Error('Could not load automations.')
      }
      setRules(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load automations.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function update(rule: Automation, remove = false) {
    if (busyId) return
    setBusyId(rule.id)
    setError(null)
    try {
      const response = await fetch(
        remove ? `/api/automations?id=${rule.id}` : '/api/automations',
        {
          method: remove ? 'DELETE' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          ...(remove
            ? {}
            : {
                body: JSON.stringify({
                  id: rule.id,
                  is_active: !rule.is_active,
                }),
              }),
        },
      )
      if (!response.ok) throw new Error('Could not save that change.')
      setRules((current) =>
        remove
          ? current.filter((item) => item.id !== rule.id)
          : current.map((item) =>
              item.id === rule.id
                ? { ...item, is_active: !item.is_active }
                : item,
            ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save that change.',
      )
    } finally {
      setBusyId(null)
    }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rules
    return rules.filter((rule) =>
      `${rule.name} ${rule.trigger_value} ${rule.response_content?.message ?? ''}`
        .toLowerCase()
        .includes(needle),
    )
  }, [rules, query])

  const activeCount = rules.filter((rule) => rule.is_active).length

  if (sessionLoading) return <ListSkeleton count={4} />

  if (!userId) {
    return (
      <div className="section-stack">
        <PageHeader>
          <PageHeaderText>
            <Eyebrow>Automations</Eyebrow>
            <PageHeaderTitle>Auto replies</PageHeaderTitle>
          </PageHeaderText>
        </PageHeader>
        <Alert variant="warning">
          <AlertDescription>
            Connect your Instagram account on the home page to create automations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Editing replaces the list view entirely rather than opening a modal: the
  // form is long, and scrolling inside a dialog on mobile is worse than a
  // dedicated view with a back control.
  if (edit) {
    return (
      <div className="section-stack">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEdit(null)}
          className="self-start -ml-2"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to auto replies
        </Button>
        <CreateRuleForm
          key={edit.id}
          userId={userId}
          triggerSource={edit.trigger_source}
          editRule={edit}
          onSuccess={() => {
            setEdit(null)
            void refresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className="section-stack">
      <PageHeader>
        <PageHeaderText>
          <Eyebrow>
            {activeCount} active of {rules.length}
          </Eyebrow>
          <PageHeaderTitle>Auto replies</PageHeaderTitle>
          <PageHeaderDescription>
            A keyword comes in. Your answer goes out.
          </PageHeaderDescription>
        </PageHeaderText>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="link-underline"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}

      <QuickAutomationForm
        userId={userId}
        initialSource="dm"
        onSuccess={(source) => {
          setSavedSource(source)
          void refresh()
        }}
      />

      {savedSource && (
        <QuickAutomationSavedNotice source={savedSource} />
      )}

      <section className="flex flex-col gap-3" aria-labelledby="your-replies">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="your-replies"
            className="text-base font-semibold leading-6"
          >
            Your replies
            <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
              {rules.length}
            </span>
          </h2>
          {rules.length > 0 && (
            <AutomationSearch
              value={query}
              onChange={setQuery}
              resultCount={filtered.length}
            />
          )}
        </div>

        {loading ? (
          <ListSkeleton count={3} />
        ) : rules.length === 0 ? (
          <AutomationList
            rules={[]}
            busyId={null}
            onToggle={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No replies match &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <div className="card card-none px-4 sm:px-5">
            <AutomationList
              rules={filtered}
              busyId={busyId}
              onToggle={(rule) => void update(rule)}
              onEdit={setEdit}
              onDelete={(rule) => void update(rule, true)}
            />
          </div>
        )}
      </section>

      <AssistantSettings userId={userId} />
    </div>
  )
}
