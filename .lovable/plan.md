

## Problem
The error "A user with this email address has already been registered" appears in English because the translation map in `Auth.tsx` uses "User already registered" as the key. The `includes()` check is case-sensitive, and the actual Supabase error message uses lowercase "user" with different phrasing, so it doesn't match.

## Fix
Update the `translateAuthError` map in `src/pages/Auth.tsx` to add the exact Supabase error string as a key:

- Add: `"email address has already been registered"` → `"Este e-mail já está cadastrado"`

This partial match will catch the full error message via `includes()`. The existing "User already registered" entry can stay as a fallback for other variations.

## Files Changed
- `src/pages/Auth.tsx` — Add one entry to the translation map (line ~20)

