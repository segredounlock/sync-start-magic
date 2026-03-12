

## Problem

The integrity check (`runIntegrityCheck`) uses `fetch(HEAD)` to request source file paths (e.g., `src/App.tsx`) from the web server. In a Vite-built app, source files are bundled and not accessible at their original paths — so **all files will always be reported as missing**. This approach only works during Vite dev mode (where source files are served), not in production.

## Solution

Replace the HTTP-based check with a **build-time manifest approach**:

1. **Create a Vite plugin** that generates a JSON manifest at build time listing all existing source files from `SOURCE_PATHS`.
2. **At runtime**, the integrity check compares the `SOURCE_PATHS` list against the build-time manifest to identify any files that were missing when the app was built.
3. This works in both dev and production because the manifest is embedded/imported at build time.

## Implementation Steps

### 1. Create a Vite plugin (`src/lib/buildManifest.ts`)
- Use `import.meta.glob` to eagerly resolve all source paths at build time
- Export a set of known-existing file paths

### 2. Create `src/lib/sourceManifest.ts`
- Use `import.meta.glob('/src/**/*.{tsx,ts,css}', { eager: false })` to get all files Vite can see
- Also include edge function paths via a second glob for `supabase/functions/**/*.ts`
- Export a function `getExistingPaths()` that returns the resolved keys

### 3. Update `BackupSection.tsx` → `runIntegrityCheck`
- Instead of `fetch(HEAD)`, import the manifest and compare against `effectivePaths`
- For each path in `effectivePaths`, check if it exists in the glob result
- This is instant (no network requests) and works in all environments

### Technical Detail

```typescript
// src/lib/sourceManifest.ts
const srcFiles = import.meta.glob('/src/**/*.{tsx,ts,css}', { eager: false });
const edgeFnFiles = import.meta.glob('/supabase/functions/**/*.ts', { eager: false });
const allFiles = { ...srcFiles, ...edgeFnFiles };

export function getKnownPaths(): string[] {
  // Keys are like "/src/App.tsx" — strip leading "/"
  return Object.keys(allFiles).map(k => k.slice(1));
}
```

```typescript
// In BackupSection.tsx runIntegrityCheck:
import { getKnownPaths } from "@/lib/sourceManifest";

const runIntegrityCheck = async () => {
  setIntegrityChecking(true);
  setIntegrityResult(null);
  const knownPaths = getKnownPaths();
  const missing: string[] = [];
  let found = 0;
  for (const filePath of effectivePaths) {
    if (knownPaths.includes(filePath)) { found++; }
    else { missing.push(filePath); }
  }
  setIntegrityResult({ missing, found, total: effectivePaths.length });
  // ... toast messages unchanged
  setIntegrityChecking(false);
};
```

### 4. Update `SOURCE_PATHS`
- Ensure `src/AppRoot.tsx` and `src/styles/app.css` are included (added during the cache workaround)
- Verify all edge function paths are current

This approach is instant, works in production, and accurately reflects the actual project files.

