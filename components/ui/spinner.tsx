import { cn } from '@/lib/utils'

/**
 * §16.1 — Spinner. The only spinner in the system. Takes its colour from
 * `currentColor` and scales with its container, so it inherits button colour
 * and neutral page-loader treatment automatically.
 */
function Spinner({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      {...props}
    >
      <svg
        className="size-[1em] animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeOpacity="0.2"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export { Spinner }
