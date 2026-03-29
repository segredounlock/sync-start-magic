Implement a full hardening upgrade for the license system, covering `InstallWizard`, `LicenseGate`, and anti-bypass protections.

The goal is to make mirror installations reliable, prevent self-referencing, ensure correct persistence of the master server configuration, and block common bypass attempts.

---

# MAIN OBJECTIVE

Strengthen the license architecture so that:

- mirror projects always point to the real master server
- the current project cannot accidentally validate against itself
- missing or corrupted `license_master_url` is detected early
- `LicenseGate` can reliably identify master vs mirror mode
- common client-side bypass attempts are mitigated
- the app fails securely when license validation is unavailable or inconsistent

---

# FILES TO UPDATE

- `src/components/InstallWizard.tsx`
- `src/components/LicenseGate.tsx`

If needed, create helper utilities such as:

- `src/utils/licenseConfig.ts`
- `src/utils/licenseValidation.ts`

---

# PART 1 — HARDEN `InstallWizard.tsx`

## 1. Replace dynamic master URL with fixed constants

Find this:

```ts
const MASTER_SERVER_URL = import.meta.env.VITE_SUPABASE_URL;

```

Replace with:

```ts
const MASTER_SERVER_URL = "https://xtkqyjruyuydlbvwduuy.supabase.co";
const MASTER_PROJECT_URL = "https://recargasbrasill.com";

```

Do not derive the master URL from `VITE_SUPABASE_URL`.

Reason:  
`VITE_SUPABASE_URL` represents the current project. In a mirror installation, this may point to the mirror itself, which creates self-validation loops and invalid configuration.

---

## 2. Add explicit validation to prevent self-reference

Before any license validation logic runs, verify that the master server is not the current project:

```ts
if (!MASTER_SERVER_URL) {
  throw new Error("Master server URL is not defined.");
}

if (MASTER_SERVER_URL === import.meta.env.VITE_SUPABASE_URL) {
  throw new Error("Invalid configuration: the master server cannot be the same as the current project.");
}

```

This is mandatory.

---

## 3. Add connectivity validation before `callValidation`

Create a helper like this:

```ts
async function validateMasterServerConnection(masterUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${masterUrl}/functions/v1/license-validate`, {
      method: "OPTIONS",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response) {
      throw new Error("No response from master server.");
    }
  } catch (error) {
    clearTimeout(timeout);
    throw new Error("Unable to connect to the main server. Please check your connection and try again.");
  }
}

```

Call this before `callValidation`.

If connectivity fails:

- stop installation
- show a clear user-facing error
- do not continue to save config

---

## 4. Save configuration atomically

After successful license validation, save both values in one operation:

```ts
await supabase.from("system_config").upsert(
  [
    { key: "license_master_url", value: MASTER_SERVER_URL },
    { key: "masterProjectUrl", value: MASTER_PROJECT_URL }
  ],
  { onConflict: "key" }
);

```

Do not save them in separate calls if avoidable.

---

## 5. Confirm persistence after save

Immediately verify that both values were actually persisted.

### Check `license_master_url`

```ts
const { data: masterUrlRow, error: masterUrlError } = await supabase
  .from("system_config")
  .select("value")
  .eq("key", "license_master_url")
  .single();

if (masterUrlError || !masterUrlRow || masterUrlRow.value !== MASTER_SERVER_URL) {
  throw new Error("Failed to confirm persistence of license_master_url.");
}

```

### Check `masterProjectUrl`

```ts
const { data: projectUrlRow, error: projectUrlError } = await supabase
  .from("system_config")
  .select("value")
  .eq("key", "masterProjectUrl")
  .single();

if (projectUrlError || !projectUrlRow || projectUrlRow.value !== MASTER_PROJECT_URL) {
  throw new Error("Failed to confirm persistence of masterProjectUrl.");
}

```

Installation should only complete if both checks pass.

---

## 6. Required execution order in InstallWizard

The flow must follow this exact order:

1. validate `MASTER_SERVER_URL`
2. prevent self-reference
3. validate connectivity to master server
4. execute `callValidation`
5. save `license_master_url` and `masterProjectUrl`
6. confirm both values were persisted
7. finish installation

Do not reorder this logic.

---

# PART 2 — IMPROVE `LicenseGate.tsx`

## 1. Unify master detection logic

Today there is already some domain logic like `MASTER_DOMAINS`.

Refactor the code so that master detection uses a centralized and consistent strategy.

Create a helper function:

```ts
function isMasterEnvironment(currentSupabaseUrl: string | undefined, currentHost: string | undefined) {
  const MASTER_SUPABASE_URL = "https://xtkqyjruyuydlbvwduuy.supabase.co";
  const MASTER_PROJECT_URL = "https://recargasbrasill.com";

  const normalizedHost = (currentHost || "").toLowerCase();
  const normalizedProjectUrl = MASTER_PROJECT_URL.toLowerCase();

  return (
    currentSupabaseUrl === MASTER_SUPABASE_URL ||
    normalizedHost.includes("recargasbrasill.com") ||
    normalizedProjectUrl.includes(normalizedHost)
  );
}

```

Use one source of truth for master-mode checks.

Do not scatter this logic in multiple places.

---

## 2. Load config from `system_config` safely

`LicenseGate` must attempt to load:

- `license_master_url`
- `masterProjectUrl`

from `system_config` before deciding how to validate.

Recommended helper:

```ts
async function getSystemConfigValue(supabase: any, key: string) {
  const { data, error } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.value ?? null;
}

```

Then:

```ts
const storedMasterUrl = await getSystemConfigValue(supabase, "license_master_url");
const storedMasterProjectUrl = await getSystemConfigValue(supabase, "masterProjectUrl");

```

---

## 3. Add mirror-mode validation guards

If the current project is **not** the master, then `LicenseGate` must enforce:

- `license_master_url` must exist
- `license_master_url` must not equal current `VITE_SUPABASE_URL`
- `license_master_url` must be a valid HTTPS URL
- `masterProjectUrl` should exist
- if config is missing or invalid, block app access with clear error state

Example validation:

```ts
function isValidHttpsUrl(value: string | null) {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

```

Mirror mode must fail closed, not fail open.

---

## 4. Add strict fallback behavior

If `LicenseGate` cannot determine the environment safely, default to the most secure behavior:

- if master environment is confirmed → allow master flow
- if mirror environment is confirmed but config is invalid → deny access
- if environment is ambiguous → deny access and show configuration error

Do not allow ambiguous states to bypass license checks.

---

## 5. Add structured error states in `LicenseGate`

Instead of generic failures, classify errors like:

- `MASTER_CONFIG_MISSING`
- `MASTER_CONFIG_SELF_REFERENCE`
- `MASTER_SERVER_UNREACHABLE`
- `LICENSE_VALIDATION_FAILED`
- `LICENSE_PERSISTENCE_INVALID`
- `ENVIRONMENT_AMBIGUOUS`

Display user-friendly messages, for example:

- "Main server configuration is missing."
- "Invalid configuration: this mirror is pointing to itself."
- "Unable to reach the main license server."
- "License validation failed."
- "System configuration could not be verified."
- "Unable to determine environment securely."

---

## 6. Revalidate on app start

When the app loads and `LicenseGate` runs:

- read config from `system_config`
- validate structure
- confirm mirror is not pointing to itself
- only then proceed to remote validation

This ensures that even if the installation saved bad values earlier, runtime will still block access.

---

# PART 3 — ANTI-BYPASS HARDENING

The goal here is to reduce common client-side or config-based bypass attempts.

## 1. Never trust only client-side environment variables

Do not rely only on:

- `VITE_SUPABASE_URL`
- hostname checks
- local state
- cached values

Always combine:

- runtime environment checks
- persisted `system_config`
- remote validation from the master server

---

## 2. Block access when `license_master_url` is missing in mirror mode

If the project is not the master and `license_master_url` is null, empty, invalid, or equals the current project URL:

- block access immediately
- do not render protected content
- do not continue with optimistic behavior

---

## 3. Prevent local bypass through tampered config

Before trusting `license_master_url`, validate:

- it is HTTPS
- it matches the approved master Supabase URL if strict mode is enabled
- it does not point to localhost
- it does not point to the current project
- it is not an empty string
- it is not malformed

Recommended strict validation:

```ts
function isApprovedMasterUrl(masterUrl: string | null) {
  return masterUrl === "https://xtkqyjruyuydlbvwduuy.supabase.co";
}

```

If the architecture only supports one real master, enforce exact match.

---

## 4. Deny access on validation request failure

If remote license validation fails due to:

- network error
- timeout
- non-2xx response
- malformed payload
- missing required fields

then deny access by default.

Do not treat network failure as temporary success.

Fail securely.

---

## 5. Require positive validation response structure

Only accept the validation response if all expected fields are present and valid.

Example:

```ts
function isValidLicenseResponse(payload: any) {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    payload.valid === true &&
    typeof payload.licenseKey === "string" &&
    payload.licenseKey.length > 0
  );
}

```

Do not accept loosely structured or partial responses.

---

## 6. Protect against stale success state

Do not keep permanent success only in memory or local state.

Recommended:

- store a short-lived validation timestamp
- revalidate on app reload
- revalidate when critical config changes
- revalidate after a defined TTL

Example TTL:

- 5 minutes
- 15 minutes
- or another explicit short interval

Do not let one old success unlock the app forever.

---

## 7. Avoid exposing override flags in the frontend

Remove or disable any logic like:

- `skipLicenseCheck`
- `devBypass`
- `forceAccess`
- `isLocalAdmin`
- permissive test mode flags in production builds

If such flags exist, ensure they are impossible to trigger in production.

---

## 8. Do not render protected UI until license state is confirmed

In `LicenseGate`, protected routes or content must not render while validation is pending.

Use explicit states:

- `loading`
- `validated`
- `denied`
- `config_error`

During loading:

- show spinner or loading screen
- do not render protected app content yet

This prevents flicker-based bypass exposure.

---

## 9. Add optional exact-origin whitelist

If desired, add a whitelist for valid master project origins:

```ts
const APPROVED_MASTER_ORIGINS = [
  "https://recargasbrasill.com",
  "https://www.recargasbrasill.com"
];

```

Use this only as an additional layer, not the only validation.

---

## 10. Normalize URLs before comparison

Always normalize before comparing URLs:

- lowercase host
- strip trailing slash
- compare origin when appropriate

Example helper:

```ts
function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.origin.toLowerCase().replace(/\/$/, "");
  } catch {
    return "";
  }
}

```

Then compare normalized values.

This prevents bypass through formatting differences.

---

# PART 4 — RECOMMENDED IMPLEMENTATION STRUCTURE

Create reusable helpers to avoid duplicated logic.

## Suggested `src/utils/licenseConfig.ts`

Include helpers such as:

- `normalizeUrl`
- `isValidHttpsUrl`
- `isApprovedMasterUrl`
- `isMasterEnvironment`
- `getSystemConfigValue`

## Suggested `src/utils/licenseValidation.ts`

Include helpers such as:

- `validateMasterServerConnection`
- `isValidLicenseResponse`
- `validateMirrorConfiguration`

---

# PART 5 — EXPECTED FINAL BEHAVIOR

## Install flow

- install wizard always uses fixed master constants
- it checks connectivity first
- it validates license
- it saves both config values
- it confirms both values were saved
- it only completes after successful persistence

## Runtime flow

- `LicenseGate` determines whether current environment is master or mirror
- if mirror:
  - loads `license_master_url` and `masterProjectUrl`
  - validates structure and anti-loop rules
  - validates license against master
  - only then allows access
- if config is missing, malformed, ambiguous, or unreachable:
  - deny access
  - show explicit secure error state

---

# PART 6 — IMPORTANT SECURITY RULES

These rules must be followed:

- fail closed, not open
- do not trust only client-side values
- do not allow ambiguous environment detection
- do not allow self-reference
- do not allow mirror access without confirmed master config
- do not render protected content before license validation completes
- do not treat network failure as license success
- do not allow permissive frontend override flags in production

---

# PART 7 — DELIVERABLE EXPECTATION

Please implement the full refactor and return:

1. updated `InstallWizard.tsx`
2. updated `LicenseGate.tsx`
3. any new utility files created
4. clean integration with existing logic
5. minimal regression risk
6. preserve existing business logic where possible, only harden validation and configuration flow

Do not just describe the changes. Apply them in code.