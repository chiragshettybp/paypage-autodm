'use client'

import * as React from 'react'
import {
  AlertCircleIcon,
  ArrowRightIcon,
  AtSignIcon,
  CheckIcon,
  ChevronLeftIcon,
  FilmIcon,
  GlobeIcon,
  HeartIcon,
  ImageIcon,
  InfoIcon,
  LinkIcon,
  LockIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  TimerIcon,
  Trash2Icon,
  ZapIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import type {
  Automation,
  ProButton,
  QuickReplyOption,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TagInput } from '@/components/ui/tag-input'
import { InlineLoader } from '@/components/shared/states'
import { StatusPill } from '@/components/shared/status-pill'
import { Eyebrow } from '@/components/shared/eyebrow'
import { SlidingTabs } from '@/components/shared/sliding-tabs'
import {
  FieldLabel,
  FormField,
  SwitchField,
  TextareaField,
} from '@/components/shared/form-field'

/**
 * The three-step workflow builder. Trigger → reply → review.
 *
 * The wizard shape and the payload it assembles are unchanged; only the
 * presentation is. The mobile-first contract: on narrow screens the steps
 * collapse into one scrolling column and the preview moves under the form,
 * because a two-pane split at 375px is unusable.
 */

type Source = Automation['trigger_source']
type ResponseType = 'text' | 'card' | 'media'
type ReplyMode = 'both' | 'dm_only' | 'public_only'
type StoryTrigger = 'mention' | 'reaction' | 'reply'
type MediaType = 'image' | 'video' | 'audio'

const STEPS = [
  {
    key: 'trigger',
    label: 'When',
    sub: 'What starts it',
    title: 'What starts this reply?',
    description: 'Pick the post, or the words, that should kick this workflow off.',
  },
  {
    key: 'response',
    label: 'Reply',
    sub: 'What they receive',
    title: 'What do they receive?',
    description: 'Choose one format and write it exactly as it should arrive.',
  },
  {
    key: 'settings',
    label: 'Review',
    sub: 'Name and publish',
    title: 'Name it and publish',
    description: 'Give the workflow a name you will recognise in the list later.',
  },
] as const

const STORY_TRIGGERS: ReadonlyArray<{
  value: StoryTrigger
  label: string
  hint: string
  icon: React.ReactNode
}> = [
  { value: 'mention', label: 'Mentions me', hint: 'Tagged in a story', icon: <AtSignIcon className="size-5" /> },
  { value: 'reaction', label: 'Reacts', hint: 'Sends an emoji reaction', icon: <HeartIcon className="size-5" /> },
  { value: 'reply', label: 'Replies', hint: 'Text reply to a story', icon: <MessageSquareIcon className="size-5" /> },
]

const REPLY_MODES: ReadonlyArray<{ value: ReplyMode; label: string; hint: string }> = [
  { value: 'both', label: 'Reply + DM', hint: 'Public comment and a DM' },
  { value: 'public_only', label: 'Reply only', hint: 'Comment on the post' },
  { value: 'dm_only', label: 'DM only', hint: 'Keep the post clean' },
]

const RESPONSE_TYPES: ReadonlyArray<{
  value: ResponseType
  label: string
  icon: React.ReactNode
}> = [
  { value: 'text', label: 'Text', icon: <MessageCircleIcon className="size-4" /> },
  { value: 'card', label: 'Card', icon: <LinkIcon className="size-4" /> },
  { value: 'media', label: 'Media', icon: <ImageIcon className="size-4" /> },
]

const MEDIA_TYPES: ReadonlyArray<{ value: MediaType; label: string }> = [
  { value: 'image', label: 'Photo' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
]

const DELAYS = [
  { value: 0, label: 'Send immediately' },
  { value: 3, label: 'After 3 seconds' },
  { value: 5, label: 'After 5 seconds' },
  { value: 10, label: 'After 10 seconds' },
  { value: 30, label: 'After 30 seconds' },
]

const MAX_BUTTONS = 3
const MAX_QUICK_REPLIES = 4

export interface CreateRuleFormProps {
  userId: string
  triggerSource: Source
  onSuccess: () => void
  editRule?: Automation | null
}

export function CreateRuleForm({
  userId,
  triggerSource,
  onSuccess,
  editRule,
}: CreateRuleFormProps) {
  const isEditing = Boolean(editRule)

  const [step, setStep] = React.useState(0)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  /* Trigger */
  const [triggers, setTriggers] = React.useState<string[]>([])
  const [storyTrigger, setStoryTrigger] = React.useState<StoryTrigger>('mention')
  const [selectedReel, setSelectedReel] = React.useState<Record<string, any> | null>(null)
  const [hasChosenPost, setHasChosenPost] = React.useState(false)

  /* Reply */
  const [responseType, setResponseType] = React.useState<ResponseType>('text')
  const [messageText, setMessageText] = React.useState('')
  const [cardTitle, setCardTitle] = React.useState('')
  const [cardSubtitle, setCardSubtitle] = React.useState('')
  const [cardImage, setCardImage] = React.useState('')
  const [buttons, setButtons] = React.useState<ProButton[]>([])
  const [mediaUrl, setMediaUrl] = React.useState('')
  const [mediaType, setMediaType] = React.useState<MediaType>('image')
  const [quickReplies, setQuickReplies] = React.useState<QuickReplyOption[]>([])

  /* Comment-only options */
  const [replyMode, setReplyMode] = React.useState<ReplyMode>('both')
  const [publicReplies, setPublicReplies] = React.useState<string[]>([])
  const [includeReplies, setIncludeReplies] = React.useState(false)

  /* Delivery */
  const [name, setName] = React.useState('')
  const [checkFollow, setCheckFollow] = React.useState(false)
  const [delaySeconds, setDelaySeconds] = React.useState(0)
  const [typingIndicator, setTypingIndicator] = React.useState(false)

  const [reels, setReels] = React.useState<any[]>([])
  const [loadingReels, setLoadingReels] = React.useState(false)
  const [reelsError, setReelsError] = React.useState<string | null>(null)

  /* ---------- Instagram media list ---------- */
  React.useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoadingReels(true)
    setReelsError(null)

    fetch(`/api/instagram/media?userId=${userId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your posts.')
        return response.json()
      })
      .then((body) => {
        if (cancelled) return
        const list =
          body?.data && Array.isArray(body.data)
            ? body.data
            : Array.isArray(body)
              ? body
              : []
        setReels(list)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setReelsError(
          err instanceof Error
            ? err.message
            : 'Could not load your posts.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoadingReels(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  /* ---------- Prefill when editing ---------- */
  React.useEffect(() => {
    if (!editRule) return

    let content: Record<string, any> = {}
    try {
      content =
        typeof editRule.response_content === 'string'
          ? JSON.parse(editRule.response_content)
          : ((editRule.response_content as Record<string, any>) ?? {})
    } catch {
      content = {}
    }

    setName(editRule.name)
    setStep(0)

    if (['mention', 'reaction', 'reply'].includes(editRule.trigger_type)) {
      setStoryTrigger(editRule.trigger_type as StoryTrigger)
    }

    setTriggers(
      (editRule.trigger_value || '')
        .split(',')
        .map((value) => value.trim())
        .filter(
          (value) =>
            value.length > 0 &&
            !['ALL', 'ALL_COMMENTS', 'ALL_MENTIONS', 'ALL_REACTIONS'].includes(
              value.toUpperCase(),
            ),
        ),
    )

    if (content.media?.url) {
      setResponseType('media')
      setMediaUrl(content.media.url)
      setMediaType(content.media.type ?? 'image')
      setMessageText(content.message ?? '')
    } else if (content.card) {
      setResponseType('card')
      setCardTitle(content.card.title ?? '')
      setCardSubtitle(content.card.subtitle ?? '')
      setCardImage(content.card.image_url ?? '')
      setButtons(
        (content.card.buttons ?? []).map((button: any, index: number) => ({
          id: `prefill-${index}`,
          ...button,
        })),
      )
    } else {
      setResponseType('text')
      setMessageText(content.message ?? '')
    }

    setQuickReplies(
      (content.quick_replies ?? []).map((reply: any, index: number) => ({
        id: `prefill-qr-${index}`,
        title: reply.title,
        payload: reply.payload,
      })),
    )
    setReplyMode(content.reply_mode ?? 'both')
    setPublicReplies(content.public_replies ?? [])
    setIncludeReplies(content.include_replies === true)
    setCheckFollow(content.check_follow === true)
    setDelaySeconds(Number(content.delay_seconds) || 0)
    setTypingIndicator(content.typing_indicator === true)

    if (editRule.specific_media_id) {
      setSelectedReel({
        id: editRule.specific_media_id,
        caption: 'Selected post',
      })
      setHasChosenPost(true)
    } else {
      setSelectedReel(null)
      setHasChosenPost(false)
    }
  }, [editRule])

  /* ---------- Name suggestion until the user types their own ---------- */
  React.useEffect(() => {
    if (name || isEditing) return
    const replyAll = triggerSource === 'comment' && triggers.length === 0
    if (replyAll) setName('Reply to every comment')
    else if (triggers.length > 0) setName(`Reply to “${triggers[0]}”`)
  }, [triggers, name, isEditing, triggerSource])

  /* ---------- Editor helpers ---------- */
  const addButton = () => {
    if (buttons.length >= MAX_BUTTONS) return
    setButtons((current) => [
      ...current,
      {
        id: `btn-${current.length}-${name.length}-${cardTitle.length}`,
        type: 'web_url',
        title: '',
        url: '',
        payload: '',
      },
    ])
  }

  const updateButton = (id: string, field: keyof ProButton, value: string) =>
    setButtons((current) =>
      current.map((button) =>
        button.id === id ? { ...button, [field]: value } : button,
      ),
    )

  const removeButton = (id: string) =>
    setButtons((current) => current.filter((button) => button.id !== id))

  const addQuickReply = () => {
    if (quickReplies.length >= MAX_QUICK_REPLIES) return
    setQuickReplies((current) => [
      ...current,
      { id: `qr-${current.length}-${name.length}`, title: '' },
    ])
  }

  const updateQuickReply = (id: string, title: string) =>
    setQuickReplies((current) =>
      current.map((reply) => (reply.id === id ? { ...reply, title } : reply)),
    )

  const removeQuickReply = (id: string) =>
    setQuickReplies((current) => current.filter((reply) => reply.id !== id))

  /* ---------- Validation ---------- */
  const needsKeywords =
    triggerSource === 'dm' ||
    (triggerSource === 'story' && storyTrigger !== 'mention')

  const triggerValid =
    triggerSource === 'comment' ? hasChosenPost : !needsKeywords || triggers.length > 0

  const replyValid =
    replyMode === 'public_only' ||
    (responseType === 'text'
      ? messageText.trim().length > 0
      : responseType === 'card'
        ? cardTitle.trim().length > 0
        : mediaUrl.trim().length > 0)

  const nameValid = name.trim().length > 0
  const canSave = triggerValid && replyValid && nameValid

  const stepValid = [triggerValid, replyValid, nameValid]

  const hint = React.useMemo(() => {
    if (step === 0) {
      if (triggerSource === 'comment' && !hasChosenPost)
        return 'Choose a post, or All posts, to continue.'
      if (needsKeywords && triggers.length === 0)
        return 'Add at least one keyword to continue.'
      return ''
    }
    if (step === 1 && !replyValid) return 'Add the reply people should receive.'
    if (step === 2 && !nameValid) return 'Give this workflow a name before publishing.'
    return ''
  }, [step, triggerSource, hasChosenPost, needsKeywords, triggers.length, replyValid, nameValid])

  /** One plain sentence describing the whole rule, for the review step. */
  const summary = React.useMemo(() => {
    const replyAll = triggerSource === 'comment' && triggers.length === 0
    const who =
      triggerSource === 'comment'
        ? replyAll
          ? 'anyone comments on your post'
          : `someone comments ${triggers.length ? `“${triggers[0]}”` : 'a keyword'}`
        : triggerSource === 'dm'
          ? `someone DMs you ${triggers.length ? `“${triggers[0]}”` : 'a keyword'}`
          : storyTrigger === 'mention'
            ? 'someone mentions you in a story'
            : storyTrigger === 'reaction'
              ? 'someone reacts to your story'
              : 'someone replies to your story'

    const what =
      replyMode === 'public_only'
        ? 'reply publicly'
        : responseType === 'card'
          ? 'send them a card with buttons'
          : responseType === 'media'
            ? `send them ${mediaType === 'image' ? 'a photo' : `a ${mediaType}`}`
            : 'send them a DM'

    return { who, what }
  }, [triggerSource, triggers, storyTrigger, replyMode, responseType, mediaType])

  /* ---------- Save ---------- */
  async function handleSubmit() {
    if (!canSave || saving) return
    setSaving(true)
    setSaveError(null)

    const replyAll = triggerSource === 'comment' && triggers.length === 0

    const content: Record<string, any> = { check_follow: checkFollow }
    if (delaySeconds > 0) content.delay_seconds = delaySeconds
    if (typingIndicator) content.typing_indicator = true
    if (triggerSource === 'comment') {
      content.reply_mode = replyMode
      if (publicReplies.length > 0) content.public_replies = publicReplies
      if (includeReplies) content.include_replies = true
    }

    const filledQuickReplies = quickReplies.filter((reply) =>
      reply.title.trim(),
    )
    if (filledQuickReplies.length > 0) {
      content.quick_replies = filledQuickReplies.map((reply) => ({
        title: reply.title.trim(),
        payload: reply.payload,
      }))
    }

    if (responseType === 'text') {
      content.message = messageText
    } else if (responseType === 'media') {
      content.media = { type: mediaType, url: mediaUrl.trim() }
      if (messageText.trim()) content.message = messageText
    } else {
      const cleanButtons = buttons
        .map((button) => {
          if (button.type === 'web_url') {
            let url = button.url?.trim() ?? ''
            if (url.startsWith('https://https://')) {
              url = url.replace('https://https://', 'https://')
            }
            return { type: 'web_url' as const, title: button.title, url }
          }
          return {
            type: 'postback' as const,
            title: button.title,
            payload: button.payload,
          }
        })
        .filter((button) => button.title.trim())
      content.card = {
        title: cardTitle,
        subtitle: cardSubtitle || undefined,
        image_url: cardImage || undefined,
        buttons: cleanButtons,
      }
    }

    const payload = {
      userId,
      name,
      trigger_source: triggerSource,
      trigger_type: replyAll
        ? 'reply_all'
        : triggerSource === 'story'
          ? storyTrigger
          : 'keyword',
      trigger_value: replyAll
        ? 'ALL_COMMENTS'
        : triggerSource === 'story' && storyTrigger === 'mention'
          ? 'ALL_MENTIONS'
          : triggerSource === 'story' &&
              storyTrigger === 'reaction' &&
              triggers.length === 0
            ? 'ALL_REACTIONS'
            : triggers.length > 0
              ? triggers.join(', ')
              : 'ALL',
      content,
      specific_media_id: selectedReel?.id ?? null,
    }

    try {
      const response = await fetch('/api/automations', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing ? { ...payload, id: editRule!.id } : payload,
        ),
      })
      if (!response.ok) throw new Error('Could not save this workflow.')
      toast.success(isEditing ? 'Workflow updated' : 'Workflow is live')
      onSuccess()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not save this workflow.'
      setSaveError(message)
      toast.error('Could not save — try again')
    } finally {
      setSaving(false)
    }
  }

  const currentStep = STEPS[step]
  const sourceLabel =
    triggerSource === 'comment'
      ? 'a post comment'
      : triggerSource === 'dm'
        ? 'a direct message'
        : 'a story'

  return (
    <div className="fade-up flex min-w-0 flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex min-w-0 flex-col gap-2">
        <Eyebrow>
          {isEditing ? 'Editing workflow' : 'New workflow'} · Step {step + 1} of{' '}
          {STEPS.length}
        </Eyebrow>
        <h2 className="text-xl font-semibold leading-7 tracking-[-0.025em] sm:text-2xl sm:leading-8">
          {currentStep.title}
        </h2>
        <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
          Started by {sourceLabel}.{' '}
          {currentStep.description}
        </p>
      </div>

      {/* ── Stepper ── */}
      <SlidingTabs
        aria-label="Workflow steps"
        value={STEPS[step].key}
        onValueChange={(value) => {
          const next = STEPS.findIndex((s) => s.key === value)
          if (next >= 0) setStep(next)
        }}
        items={STEPS.map((item, index) => ({
          value: item.key,
          label: item.label,
          icon:
            index < step ? (
              <CheckIcon className="size-4 text-success" aria-hidden="true" />
            ) : undefined,
        }))}
        listClassName="w-full [&>.t-tab]:flex-1"
        className="w-full"
      />

      {/* ── Body ── */}
      <div
        className={cn(
          'grid min-w-0 items-start gap-6',
          'min-[64rem]:grid-cols-[minmax(0,1fr)_20rem]',
        )}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (step < STEPS.length - 1) {
              if (stepValid[step]) setStep(step + 1)
              return
            }
            void handleSubmit()
          }}
          noValidate
          className="card card-none flex min-w-0 flex-col"
        >
          <fieldset disabled={saving} className="flex min-w-0 flex-col">
            <div className="min-w-0 p-4 sm:p-5">
              {/* ===== STEP 1 — WHEN ===== */}
              {step === 0 && (
                <div className="flex min-w-0 flex-col gap-5 fade-up">
                  {triggerSource === 'story' && (
                    <div className="flex min-w-0 flex-col gap-2">
                      <FieldLabel>Story interaction</FieldLabel>
                      <div
                        role="radiogroup"
                        aria-label="Story interaction"
                        className="grid grid-cols-1 gap-2 min-[40rem]:grid-cols-3"
                      >
                        {STORY_TRIGGERS.map((option) => {
                          const selected = storyTrigger === option.value
                          return (
                            <ChoiceTile
                              key={option.value}
                              role="radio"
                              aria-checked={selected}
                              selected={selected}
                              onClick={() => setStoryTrigger(option.value)}
                              icon={option.icon}
                              label={option.label}
                              hint={option.hint}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {triggerSource === 'comment' && (
                    <div className="flex min-w-0 flex-col gap-2">
                      <FieldLabel>Which post or reel?</FieldLabel>
                      {loadingReels ? (
                        <InlineLoader label="Fetching your Instagram feed" />
                      ) : reelsError ? (
                        <Alert variant="destructive">
                          <AlertDescription>{reelsError}</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="-mx-1 grid max-h-[26rem] grid-cols-3 gap-2 overflow-y-auto px-1 pb-1 min-[40rem]:grid-cols-4">
                          <PostTile
                            selected={hasChosenPost && selectedReel === null}
                            onClick={() => {
                              setSelectedReel(null)
                              setHasChosenPost(true)
                            }}
                            icon={<GlobeIcon className="size-5" />}
                            label="All posts"
                            hint="Every post and reel"
                          />
                          {reels.map((reel) => (
                            <PostTile
                              key={reel.id}
                              selected={
                                hasChosenPost && selectedReel?.id === reel.id
                              }
                              onClick={() => {
                                setSelectedReel(reel)
                                setHasChosenPost(true)
                              }}
                              imageUrl={reel.image_url}
                              imageAlt={reel.caption || 'Instagram post'}
                              label={reel.caption || 'Untitled'}
                              badge={
                                reel.media_type === 'STORY'
                                  ? 'Story'
                                  : reel.media_type === 'VIDEO'
                                    ? 'Reel'
                                    : 'Post'
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {triggerSource !== 'comment' || hasChosenPost ? (
                    <div className="flex min-w-0 flex-col gap-4 border-t border-separator pt-5">
                      {triggerSource === 'comment' ? (
                        <div className="flex min-w-0 flex-col gap-2">
                          <FieldLabel>Keywords to match</FieldLabel>
                          <TagInput
                            id="rule-keywords"
                            value={triggers}
                            onChange={setTriggers}
                            placeholder="Type a keyword, then press Enter — e.g. guide"
                          />
                          <p className="text-sm leading-4 text-muted-foreground">
                            Leave this empty to reply to every comment.
                          </p>
                        </div>
                      ) : needsKeywords ? (
                        <div className="flex min-w-0 flex-col gap-2">
                          <FieldLabel>
                            {storyTrigger === 'reaction' && triggerSource === 'story'
                              ? 'Only react on these emojis'
                              : 'Trigger keywords'}
                          </FieldLabel>
                          <TagInput
                            id="rule-keywords"
                            value={triggers}
                            onChange={setTriggers}
                            placeholder={
                              storyTrigger === 'reaction' && triggerSource === 'story'
                                ? 'e.g. ❤️, 🔥, 👍'
                                : 'Type a keyword, then press Enter — e.g. price'
                            }
                          />
                          <p className="text-sm leading-4 text-muted-foreground">
                            {storyTrigger === 'reaction' && triggerSource === 'story'
                              ? 'Leave empty to trigger on any emoji reaction.'
                              : 'Matches whole phrases, ignoring capitalisation.'}
                          </p>
                        </div>
                      ) : null}

                      {triggerSource === 'comment' && triggers.length > 0 && (
                        <div className="rounded-xl border border-border p-4">
                          <SwitchField
                            label="Check replies to comments"
                            description="Normally only primary comments start a reply. Turn this on to include the replies underneath them."
                            checked={includeReplies}
                            onCheckedChange={setIncludeReplies}
                          />
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* ===== STEP 2 — REPLY ===== */}
              {step === 1 && (
                <div className="flex min-w-0 flex-col gap-5 fade-up">
                  {triggerSource === 'comment' && (
                    <div className="flex min-w-0 flex-col gap-2">
                      <FieldLabel>Where should the reply go?</FieldLabel>
                      <div
                        role="radiogroup"
                        aria-label="Reply destination"
                        className="grid grid-cols-1 gap-2 min-[40rem]:grid-cols-3"
                      >
                        {REPLY_MODES.map((option) => (
                          <ChoiceTile
                            key={option.value}
                            role="radio"
                            aria-checked={replyMode === option.value}
                            selected={replyMode === option.value}
                            onClick={() => setReplyMode(option.value)}
                            label={option.label}
                            hint={option.hint}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {triggerSource === 'comment' && replyMode !== 'dm_only' && (
                    <div className="flex min-w-0 flex-col gap-2">
                      <FieldLabel>Public comment rotation</FieldLabel>
                      <TagInput
                        id="rule-public-replies"
                        value={publicReplies}
                        onChange={setPublicReplies}
                        placeholder="Add phrases, then press Enter"
                        preserveCase
                      />
                      <p className="text-sm leading-4 text-muted-foreground">
                        Add a few and they are rotated at random, so the replies
                        do not read like a bot.
                      </p>
                    </div>
                  )}

                  {replyMode !== 'public_only' && (
                    <div className="flex min-w-0 flex-col gap-4 border-t border-separator pt-5">
                      <div className="flex min-w-0 flex-col gap-2">
                        <FieldLabel>Message format</FieldLabel>
                        <div
                          role="radiogroup"
                          aria-label="Message format"
                          className="grid grid-cols-3 gap-2"
                        >
                          {RESPONSE_TYPES.map((option) => (
                            <ChoiceTile
                              key={option.value}
                              role="radio"
                              aria-checked={responseType === option.value}
                              selected={responseType === option.value}
                              onClick={() => setResponseType(option.value)}
                              icon={option.icon}
                              label={option.label}
                            />
                          ))}
                        </div>
                      </div>

                      {responseType === 'text' && (
                        <TextareaField
                          label="DM message"
                          rows={5}
                          maxLength={1000}
                          value={messageText}
                          onChange={(event) => setMessageText(event.target.value)}
                          placeholder="Type the message to send in DMs…"
                          action={
                            <span className="text-xs leading-4 text-muted-foreground tabular-nums">
                              {messageText.length}/1000
                            </span>
                          }
                        />
                      )}

                      {responseType === 'card' && (
                        <div className="flex min-w-0 flex-col gap-4">
                          <FormField
                            label="Card title"
                            value={cardTitle}
                            onChange={(event) => setCardTitle(event.target.value)}
                            placeholder="The headline on the card"
                          />
                          <FormField
                            label="Subtitle"
                            value={cardSubtitle}
                            onChange={(event) => setCardSubtitle(event.target.value)}
                            placeholder="One line of supporting detail (optional)"
                          />
                          <FormField
                            label="Cover image URL"
                            inputClassName="font-mono text-xs"
                            value={cardImage}
                            onChange={(event) => setCardImage(event.target.value)}
                            placeholder="https://… (optional)"
                          />

                          <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <FieldLabel>
                                Buttons ({buttons.length}/{MAX_BUTTONS})
                              </FieldLabel>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addButton}
                                disabled={buttons.length >= MAX_BUTTONS}
                                className="-mr-1"
                              >
                                <PlusIcon className="size-4" aria-hidden="true" />
                                Add
                              </Button>
                            </div>
                            {buttons.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                                No buttons yet. Add one to send people somewhere.
                              </p>
                            ) : (
                              <ul className="flex flex-col gap-2">
                                {buttons.map((button) => (
                                  <li
                                    key={button.id}
                                    className="flex min-w-0 flex-col gap-2 rounded-xl border border-border p-3 min-[40rem]:flex-row min-[40rem]:items-end"
                                  >
                                    <FormField
                                      className="min-[40rem]:flex-1"
                                      label="Label"
                                      value={button.title}
                                      onChange={(event) =>
                                        updateButton(button.id, 'title', event.target.value)
                                      }
                                      placeholder="Shop now"
                                    />
                                    <div className="flex min-w-0 gap-2 min-[40rem]:w-[10rem] min-[40rem]:shrink-0 min-[40rem]:flex-col">
                                      <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold leading-5 text-foreground">
                                        <span>Action</span>
                                        <select
                                          value={button.type}
                                          onChange={(event) =>
                                            updateButton(
                                              button.id,
                                              'type',
                                              event.target.value,
                                            )
                                          }
                                          className="select"
                                        >
                                          <option value="web_url">Open link</option>
                                          <option value="postback">Trigger flow</option>
                                        </select>
                                      </label>
                                    </div>
                                    <FormField
                                      className="min-[40rem]:flex-1"
                                      label={button.type === 'web_url' ? 'URL' : 'Flow key'}
                                      inputClassName="font-mono text-xs"
                                      value={
                                        button.type === 'web_url'
                                          ? (button.url ?? '')
                                          : (button.payload ?? '')
                                      }
                                      onChange={(event) =>
                                        updateButton(
                                          button.id,
                                          button.type === 'web_url' ? 'url' : 'payload',
                                          event.target.value,
                                        )
                                      }
                                      placeholder={
                                        button.type === 'web_url'
                                          ? 'https://…'
                                          : 'flow_keyword'
                                      }
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => removeButton(button.id)}
                                      className="text-destructive hover:bg-danger-soft"
                                      aria-label={`Remove button ${button.title || buttons.indexOf(button) + 1}`}
                                    >
                                      <Trash2Icon className="size-4" aria-hidden="true" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      {responseType === 'media' && (
                        <div className="flex min-w-0 flex-col gap-4">
                          <div className="flex min-w-0 flex-col gap-2">
                            <FieldLabel>File type</FieldLabel>
                            <div
                              role="radiogroup"
                              aria-label="File type"
                              className="grid grid-cols-3 gap-2"
                            >
                              {MEDIA_TYPES.map((option) => (
                                <ChoiceTile
                                  key={option.value}
                                  role="radio"
                                  aria-checked={mediaType === option.value}
                                  selected={mediaType === option.value}
                                  onClick={() => setMediaType(option.value)}
                                  label={option.label}
                                />
                              ))}
                            </div>
                          </div>
                          <FormField
                            label="Public file URL"
                            inputClassName="font-mono text-xs"
                            value={mediaUrl}
                            onChange={(event) => setMediaUrl(event.target.value)}
                            placeholder="https://…/clip.mp4"
                          />
                          <FormField
                            label="Caption"
                            value={messageText}
                            onChange={(event) => setMessageText(event.target.value)}
                            placeholder="Optional text sent after the file"
                          />
                        </div>
                      )}

                      {responseType !== 'card' && (
                        <div className="flex min-w-0 flex-col gap-2 border-t border-separator pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <FieldLabel>
                              Quick reply chips (
                              {quickReplies.length}/{MAX_QUICK_REPLIES})
                            </FieldLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={addQuickReply}
                              disabled={quickReplies.length >= MAX_QUICK_REPLIES}
                              className="-mr-1"
                            >
                              <PlusIcon className="size-4" aria-hidden="true" />
                              Add
                            </Button>
                          </div>
                          <p className="text-sm leading-4 text-muted-foreground">
                            Tappable suggestions the person can send back.
                          </p>
                          {quickReplies.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex min-w-0 items-end gap-2"
                            >
                              <FormField
                                className="min-w-0 flex-1"
                                label="Chip label"
                                maxLength={20}
                                value={reply.title}
                                onChange={(event) =>
                                  updateQuickReply(reply.id, event.target.value)
                                }
                                placeholder="Send details"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeQuickReply(reply.id)}
                                className="mb-0.5 text-destructive hover:bg-danger-soft"
                                aria-label={`Remove chip ${reply.title || quickReplies.indexOf(reply) + 1}`}
                              >
                                <Trash2Icon className="size-4" aria-hidden="true" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===== STEP 3 — REVIEW ===== */}
              {step === 2 && (
                <div className="flex min-w-0 flex-col gap-5 fade-up">
                  <FormField
                    label="Workflow name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Send the free guide"
                    description="Only you see this. It is how you find the rule later."
                    error={!nameValid && name.length > 0 ? ' ' : null}
                  />

                  <div className="flex min-w-0 flex-col gap-3">
                    <FieldLabel>Delivery</FieldLabel>

                    <div className="rounded-xl border border-border p-4">
                      <SwitchField
                        label="Follow gate required"
                        description="Non-followers get a follow prompt first, then the reply."
                        checked={checkFollow}
                        onCheckedChange={setCheckFollow}
                      />
                    </div>

                    <div className="rounded-xl border border-border p-4">
                      <SwitchField
                        label="Show a typing indicator"
                        description="The typing bubble appears before the message lands."
                        checked={typingIndicator}
                        onCheckedChange={setTypingIndicator}
                      />
                    </div>

                    <label className="flex min-w-0 flex-col gap-2 rounded-xl border border-border p-4 text-sm font-semibold leading-5 text-foreground">
                      <span className="flex items-center gap-2">
                        <TimerIcon
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        Send delay
                      </span>
                      <select
                        value={delaySeconds}
                        onChange={(event) =>
                          setDelaySeconds(Number(event.target.value))
                        }
                        className="select"
                      >
                        {DELAYS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm font-normal leading-5 text-muted-foreground">
                        A short pause reads far more like a person than an instant
                        reply.
                      </span>
                    </label>
                  </div>

                  {/* Plain-language summary of the rule */}
                  <div className="rounded-2xl border border-border bg-accent-soft p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-accent-soft-foreground">
                      <SparklesIcon className="size-4" aria-hidden="true" />
                      In plain language
                    </p>
                    <p className="mt-2 text-sm leading-5 text-foreground">
                      When{' '}
                      <span className="font-semibold">{summary.who}</span>, we will{' '}
                      <span className="font-semibold">{summary.what}</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Save failure ── */}
            {saveError && (
              <div className="px-4 pb-4 sm:px-5">
                <Alert variant="destructive">
                  <AlertDescription className="flex flex-wrap items-center gap-2">
                    <span>{saveError}</span>
                    <button
                      type="button"
                      onClick={() => setSaveError(null)}
                      className="link-underline"
                    >
                      Dismiss
                    </button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* ── Footer navigation ── */}
            <div className="flex flex-col-reverse items-stretch gap-3 border-t border-separator p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3 sm:min-w-0">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="shrink-0"
                  >
                    <ChevronLeftIcon className="size-4" aria-hidden="true" />
                    Back
                  </Button>
                )}
                {hint && (
                  <p className="flex min-w-0 items-center gap-1.5 text-sm leading-5 text-muted-foreground">
                    <AlertCircleIcon
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {hint}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={step < STEPS.length - 1 ? !stepValid[step] : !canSave}
                loading={step === STEPS.length - 1 && saving}
                className="shrink-0 self-end sm:self-auto"
              >
                {step < STEPS.length - 1 ? (
                  <>
                    Continue
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    {!saving && (
                      <ZapIcon className="size-4" aria-hidden="true" />
                    )}
                    {isEditing ? 'Save workflow' : 'Publish workflow'}
                  </>
                )}
              </Button>
            </div>
          </fieldset>
        </form>

        {/* ── Live preview ── */}
        {step > 0 && replyMode !== 'public_only' && (
          <aside className="min-w-0 min-[64rem]:sticky min-[64rem]:top-6">
            <MessagePreview
              source={triggerSource}
              triggers={triggers}
              storyTrigger={storyTrigger}
              responseType={responseType}
              messageText={messageText}
              cardTitle={cardTitle}
              cardSubtitle={cardSubtitle}
              cardImage={cardImage}
              buttons={buttons}
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              quickReplies={quickReplies}
              typingIndicator={typingIndicator}
            />
          </aside>
        )}
      </div>
    </div>
  )
}

/* =============================================================
   Local presentational pieces
   ============================================================= */

/** Selectable card used for every radio group in the wizard. */
function ChoiceTile({
  selected,
  onClick,
  icon,
  label,
  hint,
  ...aria
}: {
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
  label: string
  hint?: string
} & Omit<React.ComponentProps<'button'>, 'onClick' | 'type'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...aria}
      className={cn(
        'flex min-w-0 cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-3 text-left',
        'transition-standard',
        selected
          ? 'border-primary bg-accent-soft'
          : 'border-border bg-card hover:bg-surface-secondary',
      )}
    >
      <span className="flex w-full items-center gap-2">
        {icon && (
          <span
            className={cn(
              'shrink-0',
              selected ? 'text-accent-soft-foreground' : 'text-muted-foreground',
            )}
          >
            {icon}
          </span>
        )}
        <span
          className={cn(
            'min-w-0 flex-1 text-sm font-semibold leading-5',
            selected ? 'text-accent-soft-foreground' : 'text-foreground',
          )}
        >
          {label}
        </span>
        {selected && (
          <CheckIcon
            className="size-4 shrink-0 text-accent-soft-foreground"
            aria-hidden="true"
          />
        )}
      </span>
      {hint && (
        <span className="text-xs leading-4 text-muted-foreground">{hint}</span>
      )}
    </button>
  )
}

/** One selectable post in the comment-trigger picker. */
function PostTile({
  selected,
  onClick,
  imageUrl,
  imageAlt,
  label,
  badge,
  icon,
  hint,
}: {
  selected: boolean
  onClick: () => void
  imageUrl?: string
  imageAlt?: string
  label: string
  badge?: string
  icon?: React.ReactNode
  hint?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex aspect-square cursor-pointer flex-col overflow-hidden rounded-xl border text-left',
        'transition-standard',
        selected
          ? 'border-primary ring-2 ring-ring'
          : 'border-border hover:border-foreground/30',
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt ?? ''}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span className="flex flex-1 flex-col items-center justify-center gap-1.5 bg-surface-secondary p-2 text-center">
          <span
            className={cn(
              selected ? 'text-accent-soft-foreground' : 'text-muted-foreground',
            )}
          >
            {icon ?? <FilmIcon className="size-5" aria-hidden="true" />}
          </span>
          <span className="text-xs font-semibold leading-4">{label}</span>
          {hint && (
            <span className="text-[11px] leading-4 text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
      )}

      {badge && (
        <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-medium leading-4 text-foreground backdrop-blur-sm">
          {badge}
        </span>
      )}

      {imageUrl && (
        // A solid scrim, not a gradient — the caption has to stay legible over
        // an unpredictable photo.
        <span className="absolute inset-x-0 bottom-0 block truncate bg-foreground/80 px-2 py-1 text-[11px] leading-4 text-background">
          {label}
        </span>
      )}

      {selected && (
        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground check-pop">
          <CheckIcon className="size-4" aria-hidden="true" />
        </span>
      )}
    </button>
  )
}

/**
 * What the person actually receives. Deliberately not a phone mock: the point
 * is the message, and a dark device frame would fight the light product UI.
 */
function MessagePreview({
  source,
  triggers,
  storyTrigger,
  responseType,
  messageText,
  cardTitle,
  cardSubtitle,
  cardImage,
  buttons,
  mediaUrl,
  mediaType,
  quickReplies,
  typingIndicator,
}: {
  source: Source
  triggers: string[]
  storyTrigger: StoryTrigger
  responseType: ResponseType
  messageText: string
  cardTitle: string
  cardSubtitle: string
  cardImage: string
  buttons: ProButton[]
  mediaUrl: string
  mediaType: MediaType
  quickReplies: QuickReplyOption[]
  typingIndicator: boolean
}) {
  const primary = triggers[0]
  const incoming =
    source === 'comment'
      ? primary
        ? `Commented “${primary}”`
        : 'Commented on your post'
      : source === 'dm'
        ? primary
          ? `Sent “${primary}”`
          : 'Sent you a message'
        : storyTrigger === 'mention'
          ? 'Mentioned you in a story'
          : storyTrigger === 'reaction'
            ? 'Reacted to your story'
            : 'Replied to your story'

  const hasContent =
    responseType === 'text'
      ? messageText.trim().length > 0
      : responseType === 'card'
        ? cardTitle.trim().length > 0
        : mediaUrl.trim().length > 0

  const shownReplies = quickReplies.filter((reply) => reply.title.trim())

  return (
    <div className="card card-none flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold leading-5">
          <SendIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          What they receive
        </p>
        <StatusPill tone="accent" dot={false}>
          Preview
        </StatusPill>
      </div>

      <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-surface-secondary p-3">
        <div className="flex justify-start">
          <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-sm leading-5 text-foreground shadow-xs">
            {incoming}
          </p>
        </div>

        {typingIndicator && (
          <p className="text-xs leading-4 text-muted-foreground">
            Typing indicator plays…
          </p>
        )}

        {hasContent ? (
          <div className="flex min-w-0 flex-col items-end gap-2 fade-up">
            {responseType === 'text' && (
              <p className="max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm leading-5 text-primary-foreground">
                {messageText}
              </p>
            )}

            {responseType === 'card' && (
              <div className="w-full max-w-[16rem] overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                {cardImage.startsWith('http') && (
                  <img
                    src={cardImage}
                    alt=""
                    loading="lazy"
                    className="h-24 w-full object-cover"
                  />
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-semibold leading-5">
                    {cardTitle}
                  </p>
                  {cardSubtitle && (
                    <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">
                      {cardSubtitle}
                    </p>
                  )}
                </div>
                {buttons
                  .filter((button) => button.title.trim())
                  .map((button) => (
                    <p
                      key={button.id}
                      className="border-t border-separator px-3 py-2 text-center text-sm font-medium leading-5 text-accent-soft-foreground"
                    >
                      {button.title}
                    </p>
                  ))}
              </div>
            )}

            {responseType === 'media' && (
              <div className="flex w-full max-w-[14rem] flex-col items-center gap-1.5 overflow-hidden rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
                {mediaType === 'image' && mediaUrl.startsWith('http') ? (
                  <img
                    src={mediaUrl}
                    alt=""
                    loading="lazy"
                    className="w-full rounded-xl object-cover"
                  />
                ) : (
                  <>
                    <ImageIcon
                      className="size-6 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
                      {mediaType}
                    </p>
                  </>
                )}
              </div>
            )}

            {responseType === 'media' && messageText.trim() && (
              <p className="max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm leading-5 text-primary-foreground">
                {messageText}
              </p>
            )}
          </div>
        ) : (
          <p className="flex items-start gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-sm leading-5 text-muted-foreground">
            <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Your message shows up here as you write it.
          </p>
        )}

        {responseType !== 'card' && shownReplies.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {shownReplies.map((reply) => (
              <Badge key={reply.id} variant="accent" className="font-normal">
                {reply.title.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs leading-4 text-muted-foreground">
        <LockIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Exactly what is stored when you publish.
      </p>
    </div>
  )
}
