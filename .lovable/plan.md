

## Problem

The auto-detection of operator IS being triggered (confirmed in edge function logs: `action=query-operator`), but the external API call to `POST /detect-operator` is failing silently. The `detect-operator response` log never appears, meaning the `proxyPost` call either times out, returns non-JSON, or throws an error. The frontend's `useEffect` catches the error silently with `console.warn`.

The root cause is likely that the v2 API endpoint `/detect-operator` either:
1. Doesn't exist at that path (might be `/utils/detect-operator` or similar)
2. Requires a different request format
3. Returns an error that gets swallowed

## Plan

### 1. Add robust error logging and fallback in the edge function

In `supabase/functions/recarga-express/index.ts`, add better error handling around the `query-operator` action:
- Wrap the `proxyPost` call in try/catch with detailed error logging
- If the API endpoint fails, implement a **local fallback** using Brazil's phone number prefix rules (DDDs mapped to operators)
- Log the actual error so we can diagnose API issues

### 2. Add local operator detection fallback in the frontend

In `src/pages/RevendedorPainel.tsx`, add a client-side fallback for operator detection based on known Brazilian mobile number prefixes:
- If the edge function call fails or returns no operator, use a local prefix table
- Brazilian mobile numbers follow predictable patterns per operator (prefix-based)
- This ensures detection always works even if the external API is down

### 3. Improve error visibility

- Change `console.warn` to show a subtle toast on failure so users know detection was attempted
- Add a retry mechanism or manual "detect" button as fallback

### Technical details

**Local operator detection logic** (Brazilian mobile number prefixes):
- Numbers starting with specific prefixes map to known operators
- This is a well-known mapping used by ANATEL
- Will be used as fallback when the API call fails

**Edge function changes** (`recarga-express/index.ts`):
- Add try/catch around the `/detect-operator` API call
- Log the full error including HTTP status and response body
- Return a structured error so the frontend can fall back gracefully

**Frontend changes** (`RevendedorPainel.tsx`):
- If `query-operator` fails, attempt local prefix-based detection
- Show appropriate feedback to the user

