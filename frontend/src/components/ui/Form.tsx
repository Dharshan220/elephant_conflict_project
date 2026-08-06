import type { ReactNode } from 'react'
import { classNames } from '../../utils/helpers'

export function Input({
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>}
      <input
        className={classNames(
          'w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/50 focus:ring-2 focus:ring-accent/20',
          className,
        )}
        {...rest}
      />
    </label>
  )
}

export function Select({
  label,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>}
      <select
        className={classNames(
          'w-full cursor-pointer rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

export function Textarea({
  label,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>}
      <textarea
        className={classNames(
          'w-full resize-none rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/50 focus:ring-2 focus:ring-accent/20',
          className,
        )}
        {...rest}
      />
    </label>
  )
}

export function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </div>
  )
}