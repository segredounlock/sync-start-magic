export function TicketListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl bg-muted/40 animate-pulse space-y-2">
          <div className="h-3 w-3/4 bg-muted rounded" />
          <div className="h-2.5 w-1/2 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className={`rounded-2xl p-3 animate-pulse ${i % 2 === 0 ? "bg-muted/40 w-2/3" : "bg-primary/10 w-1/2"}`}>
            <div className="h-3 w-full bg-muted rounded mb-1" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
