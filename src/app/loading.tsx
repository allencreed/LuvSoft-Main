export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-canvas">
      <div className="flex items-center gap-3" role="status" aria-label="Loading">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:400ms]" />
        <span className="ml-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted-48">
          Loading
        </span>
      </div>
    </div>
  );
}
