'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

/**
 * §10 — Form field. Label 14px/600 above the control, optional 14px
 * help text below, and a 16px error slot that is ALWAYS reserved so a message
 * appearing never shifts the layout.
 *
 * The id is generated when not supplied and wired to both the control and the
 * help/error text, so the label association is never left to chance.
 */

function useFieldIds(providedId?: string) {
  const generated = React.useId()
  return {
    id: providedId ?? generated,
    descriptionId: `${providedId ?? generated}-description`,
    errorId: `${providedId ?? generated}-error`,
  }
}

function FieldLabel({
  id,
  className,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      htmlFor={id}
      className={cn('text-sm font-semibold leading-5 text-foreground', className)}
      {...props}
    />
  )
}

function FieldError({ id, className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      id={id}
      role="alert"
      className={cn('text-sm leading-4 text-destructive', className)}
      {...props}
    />
  )
}

type FormFieldProps = Omit<React.ComponentProps<'input'>, 'id' | 'className'> & {
  id?: string
  label: React.ReactNode
  /** 14px helper text. Replaced by the error message when one is present. */
  description?: React.ReactNode
  error?: string | null
  /** Rendered at the trailing edge of the label row, e.g. a character count. */
  action?: React.ReactNode
  className?: string
  inputClassName?: string
}

function FormField({
  id: providedId,
  label,
  description,
  error,
  action,
  className,
  inputClassName,
  required,
  ...props
}: FormFieldProps) {
  const { id, descriptionId, errorId } = useFieldIds(providedId)
  const describedBy = error ? errorId : description ? descriptionId : undefined

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel id={id}>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </FieldLabel>
        {action}
      </div>
      <Input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClassName}
        {...props}
      />
      {/* Always occupies 16px so validation never reflows the form */}
      <div className="field-error-reserve">
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : description ? (
          <p id={descriptionId} className="text-sm leading-4 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

type TextareaFieldProps = Omit<
  React.ComponentProps<'textarea'>,
  'id' | 'className'
> & {
  id?: string
  label: React.ReactNode
  description?: React.ReactNode
  error?: string | null
  action?: React.ReactNode
  className?: string
  textareaClassName?: string
}

function TextareaField({
  id: providedId,
  label,
  description,
  error,
  action,
  className,
  textareaClassName,
  required,
  ...props
}: TextareaFieldProps) {
  const { id, descriptionId, errorId } = useFieldIds(providedId)
  const describedBy = error ? errorId : description ? descriptionId : undefined

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel id={id}>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </FieldLabel>
        {action}
      </div>
      <Textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={textareaClassName}
        {...props}
      />
      <div className="field-error-reserve">
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : description ? (
          <p id={descriptionId} className="text-sm leading-4 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** §10.1 — Switch row. Label left, control right, help text beneath. */
function SwitchField({
  id: providedId,
  label,
  description,
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof Switch>,
  'id' | 'className' | 'aria-describedby'
> & {
  id?: string
  label: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const { id, descriptionId } = useFieldIds(providedId)
  return (
    <div className={cn('flex min-w-0 items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <FieldLabel id={id} className="cursor-pointer">
          {label}
        </FieldLabel>
        {description && (
          <p id={descriptionId} className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        aria-describedby={description ? descriptionId : undefined}
        className="mt-0.5 shrink-0"
        {...props}
      />
    </div>
  )
}

export { FormField, TextareaField, SwitchField, FieldLabel, FieldError }
