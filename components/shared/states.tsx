import { AlertCircle, Inbox, Loader2 } from "lucide-react"

/**
 * Centered empty-state message with an optional icon and action slot. Use when
 * a list or query returns no results.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <Inbox className="h-8 w-8" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

/**
 * Centered loading indicator for data-fetching pages and suspense boundaries.
 */
export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label ? <span>{label}</span> : null}
    </div>
  )
}

/**
 * Centered error state with an optional retry action.
 */
export function ErrorState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-destructive">
      <AlertCircle className="h-8 w-8" aria-hidden />
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
