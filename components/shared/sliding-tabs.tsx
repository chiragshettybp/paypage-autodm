'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * §12.9 — Sliding tabs. A single pill slides between items on a 200ms
 * ease-out; it never cross-fades and never re-renders the label.
 *
 * The pill is positioned by measurement, not by CSS grid, because the widths
 * are content-driven. On mount, on selection change, and on resize the pill is
 * re-measured; the scroll container scrolls the active tab into view so it is
 * never hidden on a narrow screen.
 */

export interface SlidingTabItem<T extends string = string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
}

function SlidingTabs<T extends string = string>({
  items,
  value,
  onValueChange,
  size = 'md',
  className,
  listClassName,
  'aria-label': ariaLabel,
}: {
  items: readonly SlidingTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  size?: 'md' | 'lg'
  className?: string
  listClassName?: string
  'aria-label'?: string
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const pillRef = React.useRef<HTMLSpanElement>(null)
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  // Skip the first measurement pass so the pill doesn't animate in from 0.
  const readyRef = React.useRef(false)

  const measure = React.useCallback(() => {
    const pill = pillRef.current
    const scroll = scrollRef.current
    if (!pill || !scroll) return

    const activeIndex = items.findIndex((item) => item.value === value)
    const active = activeIndex >= 0 ? items[activeIndex] : undefined
    const node = active ? tabRefs.current[active.value] : undefined

    if (!node) {
      pill.style.opacity = '0'
      return
    }

    const next = {
      x: node.offsetLeft - scroll.scrollLeft,
      width: node.offsetWidth,
    }

    if (!readyRef.current) {
      // First paint: apply without transition
      pill.style.transition = 'none'
      pill.style.transform = `translateX(${next.x}px)`
      pill.style.width = `${next.width}px`
      pill.style.opacity = '1'
      // Force a reflow so the next change animates
      void pill.offsetWidth
      pill.style.transition = ''
      readyRef.current = true
      return
    }

    pill.style.transform = `translateX(${next.x}px)`
    pill.style.width = `${next.width}px`
    pill.style.opacity = '1'
  }, [items, value])

  React.useLayoutEffect(() => {
    measure()
  }, [measure])

  React.useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll) return

    const observer = new ResizeObserver(() => measure())
    observer.observe(scroll)
    for (const item of items) {
      const node = tabRefs.current[item.value]
      if (node) observer.observe(node)
    }

    return () => observer.disconnect()
  }, [items, measure])

  // Keep the selected tab reachable when the list overflows
  React.useEffect(() => {
    const scroll = scrollRef.current
    const node = tabRefs.current[value]
    if (!scroll || !node) return
    const left = node.offsetLeft
    const right = left + node.offsetWidth
    if (left < scroll.scrollLeft) {
      scroll.scrollTo({ left: left - 4, behavior: 'smooth' })
    } else if (right > scroll.scrollLeft + scroll.clientWidth) {
      scroll.scrollTo({
        left: right - scroll.clientWidth + 4,
        behavior: 'smooth',
      })
    }
  }, [value])

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const enabled = items.filter((item) => !item.disabled)
    const currentIndex = enabled.findIndex((item) => item.value === value)
    if (currentIndex < 0) return

    let nextIndex: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % enabled.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = enabled.length - 1
    }

    if (nextIndex === null) return
    event.preventDefault()
    const next = enabled[nextIndex]
    onValueChange(next.value)
    tabRefs.current[next.value]?.focus()
  }

  return (
    <div
      data-slot="sliding-tabs"
      className={cn('t-tabs max-w-full', size === 'lg' && 't-tabs-lg', className)}
    >
      <div
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn('t-tabs-scroll scroll-contain', listClassName)}
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          className="t-tabs-pill"
          style={{ opacity: 0 }}
        />
        {items.map((item) => {
          const selected = item.value === value
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[item.value] = node
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              className={cn('t-tab', item.disabled && 'cursor-not-allowed opacity-50')}
            >
              {item.icon}
              {item.label}
              {item.badge}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { SlidingTabs }
