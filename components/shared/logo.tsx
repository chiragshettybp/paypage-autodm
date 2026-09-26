'use client'

import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

/**
 * §12.1 — Wordmark. A logo image with the name "Paypage AutoDm".
 */
interface LogoProps extends React.ComponentProps<'a'> {
  markClassName?: string
  textClassName?: string
  href?: string
  showText?: boolean
}

export function Logo({
  className,
  markClassName,
  textClassName,
  href,
  showText = true,
  ...props
}: LogoProps) {
  const mark = (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-xl',
        markClassName,
      )}
    >
      <img
        src="/logo.png"
        alt=""
        className="h-5 w-auto object-contain"
      />
    </span>
  )

  const name = showText && (
    <span
      className={cn(
        'text-base font-semibold leading-none tracking-[-0.02em]',
        textClassName,
      )}
    >
      Paypage AutoDm
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex shrink-0 items-center gap-2.5 transition-standard',
          className,
        )}
        {...props}
      >
        {mark}
        {name}
      </Link>
    )
  }

  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-2.5', className)}
      {...props}
    >
      {mark}
      {name}
    </span>
  )
}