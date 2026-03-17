

## Plan: Add "Meus Tickets" section to the reseller support tab

### What changes

1. **Create `src/components/MyTickets.tsx`** — A new read-only component that fetches and displays the current user's support tickets from `support_tickets` table (filtered by `user_id = auth.uid()`). It will show:
   - List of tickets with status badge (Aberto/Respondido/Fechado), message preview, creation date
   - Expandable detail view showing full message, admin reply (if any), and replied_at timestamp
   - Filter by status (all/open/answered/closed)
   - Real-time updates via Supabase channel subscription
   - Empty state when no tickets exist

2. **Update `src/pages/RevendedorPainel.tsx`** — In the `tab === "suporte"` section, add the `MyTickets` component above or below the existing `SupportTab` (support channel configuration). This gives resellers both their ticket history and their support channel settings in one tab.

### Technical details

- The RLS policy `"Users can view own tickets"` (just created) already ensures users only see their own tickets via `user_id = auth.uid()`.
- Query: `supabase.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false })`
- Reuse the same `STATUS_MAP` pattern from `SupportSection.tsx` for consistent status badges.
- No database changes needed — the existing table and RLS policy are sufficient.

