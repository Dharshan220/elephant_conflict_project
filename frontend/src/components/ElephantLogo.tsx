import { classNames } from '../utils/helpers'

export default function ElephantLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classNames(className)}
      aria-hidden="true"
    >
      <path d="M7.6 9.4C7.6 6.6 9.8 4.6 12.5 4.6c2.6 0 4.8 2 4.8 4.8" />
      <path d="M7.6 9.4c-1.7 0-2.7 1.4-2.7 3.5 0 1.3.7 2.1 1.6 2.1.8 0 1.4-.6 1.4-1.4" />
      <path d="M8.9 14.4v4M12.5 14.8V19M16.1 14.4v4" />
      <circle cx="11.6" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <path d="M17.8 7.5c1.2.4 2 1.3 2.2 2.6" />
    </svg>
  )
}