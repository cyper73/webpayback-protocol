# Humanity SDK integration review

> **What this PR contains:** two minimal "starter" code fixes that unblock everything else, plus written guidance for the rest. Each remaining issue ships with a `prompt`-tagged code block you can paste into your own AI assistant.
>
> **Scope of code changes in this PR:**
>
> - `client/src/App.tsx` — `<HumanityProvider>` wrapper now configured correctly.
> - `server/services/humanityProtocol.ts` — backend SDK initialised correctly, no longer silently swallowed.
> - `.env.example` — adds the env vars the two fixes above need.
>
> **Everything else in this document is guidance, not code.** The intent is to surface the issues clearly enough that you can drive the remaining fixes with your own coding AI, rather than have a stranger's patches dropped into your repo.

---

## TL;DR — the user-visible bug this is fixing

Today, in every realistic code path:

- The `HumanitySDK` constructor in `humanityProtocol.ts` throws on `environment: 'sandbox'` (only `'production' | 'staging' | 'testnet'` are valid).
- The throw is swallowed by a `try/catch`, leaving `this.sdk = null`.
- Every route then falls through to a hardcoded fallback:
  ```ts
  isVerified = true;
  score = 85;
  ```
  which appears in five places: `humanityProtocol.ts:110`, `:201`, `routes/humanity.ts:184`, `:202`, `:395`, `:412`.
- On the client, `<HumanityProvider environment="sandbox" ...>` in `App.tsx:99-103` triggers the same exception inside `useMemo`, so the React Provider is broken too — which is why login tends to hang or no-op.

**Net effect: any user who completes the OAuth round-trip is treated as a verified human with a non-trivial score, regardless of whether they scanned a palm.** The biometric multiplier described in `ARCHITECTURE_OVERVIEW.md` § Phase 3 is not actually gated on biometric verification.

The two fixes in this PR don't fully close that hole, but they make it possible to *see* the hole — which is the prerequisite for closing it.

---

## What's fixed in this PR (1) — the React `<HumanityProvider>` wrapper

### Where
`client/src/App.tsx` lines 99-103.

### Before

```tsx
<HumanityProvider
  clientId={import.meta.env.VITE_HUMANITY_CLIENT_ID || 'app_…'}
  redirectUri={'http://localhost:5000/login'}
  environment="sandbox"
>
```

### After

```tsx
<HumanityProvider
  clientId={import.meta.env.VITE_HUMANITY_CLIENT_ID || 'app_…'}
  redirectUri={import.meta.env.VITE_HUMANITY_REDIRECT_URI ?? 'http://localhost:5000/login'}
  environment={(import.meta.env.VITE_HUMANITY_ENVIRONMENT ?? 'testnet') as 'production' | 'staging' | 'testnet'}
  storage="localStorage"
>
```

### Why each prop changed

- **`environment`** — `"sandbox"` is not a registered name. The connect-sdk only knows `production | staging | testnet` (`connect-sdk/src/internal/environment.ts`). The react-sdk's `mapEnvironmentToSdk` is identity (`(env) => env`), so the bad string passes straight through and the underlying SDK throws inside `useMemo` → Provider tree breaks.
- **`redirectUri`** — was hardcoded to localhost, breaking any non-local deploy. Now driven from `VITE_HUMANITY_REDIRECT_URI` so prod/staging configs can pin their own callback URL.
- **`storage`** — defaulted to `'memory'`, meaning the access token vanishes on every page refresh. `useHumanity().getAccessToken()` then returns `null`, the `/api/humanity/sync` call silently sends `accessToken: null`, and the user appears to be logged in (because of the `localStorage` workaround in `Login.tsx:97`) while having no usable token. `'localStorage'` persists the actual token, not just metadata.

### What this **does not** fix

- The `scopes: ['openid']` problem in `Login.tsx:31` and `HumanityStatus.tsx:142` (see "Pending #1" below).
- The `humanity_score` references in `<HumanityProfile showFields={...} />` (see "Pending #4").

These are intentionally left for you to fix yourself — see prompts further down.

---

## What's fixed in this PR (2) — one correct backend SDK init

### Where
`server/services/humanityProtocol.ts` lines 46-62.

### Before

```ts
if (HUMANITY_CLIENT_ID && HUMANITY_CLIENT_SECRET) {
  try {
    this.sdk = new HumanitySDK({
      clientId: HUMANITY_CLIENT_ID,
      clientSecret: HUMANITY_CLIENT_SECRET,
      redirectUri: HUMANITY_REDIRECT_URI,
      environment: 'sandbox',
    });
    console.log("🟢 Humanity SDK initialized successfully in Sandbox mode");
  } catch (err) {
    console.error("🔴 Failed to initialize Humanity SDK:", err);
  }
}
```

### After

```ts
if (HUMANITY_CLIENT_ID && HUMANITY_CLIENT_SECRET) {
  const env = (process.env.HUMANITY_ENVIRONMENT ?? 'testnet') as 'production' | 'staging' | 'testnet';
  this.sdk = new HumanitySDK({
    clientId: HUMANITY_CLIENT_ID,
    clientSecret: HUMANITY_CLIENT_SECRET,
    redirectUri: HUMANITY_REDIRECT_URI,
    environment: env,
  });
  console.log(`🟢 Humanity SDK initialized in ${env} mode`);
}
```

### Why both changes matter

1. **`environment: 'sandbox'` → env-driven `'testnet'` default.** Same root cause as the client wrapper.
2. **`try/catch` removed.** This is the bigger change. With the catch in place, a misconfigured identity SDK boots into a degraded state where every route sees `this.sdk === null` and falls through to `isVerified = true; score = 85`. **A misconfigured identity SDK must crash on boot, not silently grant verification.** Removing the catch makes that invariant a hard failure instead of a silent one.

### What this **does not** fix

- The five `isVerified = true; score = 85` fallbacks themselves. They no longer fire from `this.sdk === null`, but they *will* fire the moment a real preset call returns errors. Closing them is "Pending #2" below.
- The wrong preset names being requested (`humanity_score`, `social_accounts`, `email`, `*_connected`) — "Pending #2" below.
- The 3-branch `as any` parser at every preset response site — "Pending #3" below.

---

## Pending #1 — frontend scopes don't match backend preset reads (severity: critical)

### Where
- `client/src/pages/Login.tsx:31` — `humanityLogin({ mode: 'redirect', scopes: ['openid'] })`
- `client/src/components/creators/HumanityStatus.tsx:142` — `<HumanityConnect scopes={['openid']} ... />`
- `client/src/components/creators/CreatorPortal.tsx` — same pattern

### Why it's wrong

In this SDK, **a preset _is_ a scope**. To call `verifyPresets({ presets: ['is_human'] })` server-side, the access token must have been issued with the `is_human` scope at OAuth time. The mapping is in `connect-sdk/src/utils/ts-types/presets.ts`:

```ts
export enum PresetScope {
  IS_HUMAN      = 'hp:presets.is_human',
  PALM_VERIFIED = 'hp:presets.palm_verified',
  IS_18_PLUS    = 'hp:presets.is_18_plus',
  // …
}
```

Right now you request `['openid']` only, then the backend tries to read `is_human` and `humanity_score` with that token. The API returns `E4003` (forbidden — insufficient scope) for every preset, the SDK puts those into `result.errors[]`, and your code does:

```ts
if (results?.errors?.length > 0) {
  isVerified = true;
  score = 85;     // ← unverified user is now "verified"
}
```

This means every login currently grants verification, regardless of palm-scan state, **on every fresh OAuth round-trip** — not just edge cases.

### Prompt to fix with AI

```prompt
Files:
  - client/src/pages/Login.tsx (around line 28-34)
  - client/src/components/creators/HumanityStatus.tsx (around line 142)
  - client/src/components/creators/CreatorPortal.tsx (any HumanityConnect / humanityLogin call)

The frontend currently calls humanityLogin / HumanityConnect with
scopes: ['openid'], but the backend then tries to read presets like
is_human and palm_verified using the resulting access token. In the
@humanity-org/connect-sdk preset model, "preset" and "scope" are the
same thing — to read is_human server-side, the token must have been
issued with the is_human scope at OAuth time. With only 'openid', every
verifyPresets call returns E4003 errors that our backend then swallows
into "isVerified = true; score = 85", granting verification to
unverified users.

Please:

1. Replace every occurrence of scopes: ['openid'] with
   scopes: ['openid', 'is_human', 'palm_verified'].
2. Do NOT add scopes that don't exist in this SDK version. The valid
   preset list is: is_human, is_18_plus, is_21_plus,
   is_accredited_investor, is_qualified_purchaser,
   is_institutional_investor, palm_verified, age_gate_alcohol,
   age_gate_gambling, investment_gate. (See
   node_modules/@humanity-org/connect-sdk/dist/utils/ts-types/presets.*)
3. Add a const SCOPES = ['openid', 'is_human', 'palm_verified'] at the
   top of Login.tsx and reuse it everywhere, so the set is defined once.

Do not touch the backend in this commit.
```

---

## Pending #2 — backend requests presets that don't exist in this SDK version (severity: critical)

### Where
- `server/services/humanityProtocol.ts:104` — `['is_human', 'humanity_score']`
- `server/services/humanityProtocol.ts:183-195` — eleven-preset list including `google_connected`, `email`, `social_accounts`, etc.
- `server/routes/humanity.ts:174` and `:390` — `['is_human', 'humanity_score']`

### Why it's wrong

The SDK's authoritative preset list (`connect-sdk/src/utils/ts-types/presets.ts:14-26`):

```ts
export type PresetName =
  | 'is_human'
  | 'is_18_plus'
  | 'is_21_plus'
  | 'is_accredited_investor'
  | 'is_qualified_purchaser'
  | 'is_institutional_investor'
  | 'palm_verified'
  | 'age_gate_alcohol'
  | 'age_gate_gambling'
  | 'investment_gate';
```

Of the presets your code requests, **only `is_human`** exists. `humanity_score`, `social_accounts`, `email`, and the seven `*_connected` presets are not in this SDK version. The API rejects each one, lands them in `result.errors[]`, and the same insecure fallback fires.

The npm-published README lists these other presets — but the README is *ahead of the code shipped in this SDK version*. **Trust the type definitions, not the README.**

### Prompt to fix with AI

```prompt
Files:
  - server/services/humanityProtocol.ts
  - server/routes/humanity.ts

Every sdk.verifyPresets() call requests preset names that are not in the
PresetName union of @humanity-org/connect-sdk. The valid set in this
SDK version is exactly:
  is_human, is_18_plus, is_21_plus, is_accredited_investor,
  is_qualified_purchaser, is_institutional_investor, palm_verified,
  age_gate_alcohol, age_gate_gambling, investment_gate.

The current code requests humanity_score, social_accounts, email, and
several *_connected presets that simply do not exist. The API rejects
them, the SDK puts them into result.errors[], and our code then sets
isVerified = true; score = 85, granting verification to unverified
users.

Please:

1. Replace every verifyPresets call argument with:
       { presets: ['is_human', 'palm_verified'] }
2. Delete code paths that read humanity_score, social_accounts, email,
   *_connected — they will always be undefined. List the deleted UI
   reads in the PR description so they don't silently rot.
3. Compute humanityScore server-side from the two real presets, with
   this policy (write it as a const ladder with a comment explaining
   why these thresholds):
       palm_verified === true → 95
       is_human === true      → 60
       neither                → 0  (and isVerified = false)
4. If verifyPresets returns ANY entry in result.errors[], throw — do
   NOT set isVerified = true. The "score = 85 on errors" branch is the
   security bug we are closing here.
5. Add a TODO comment near the score ladder noting that when the SDK
   exposes a real humanity_score preset, this should be replaced.

Do not touch OAuth/state/CSRF code in this commit.
```

---

## Pending #3 — preset response parsed via 3 guessed `as any` branches (severity: high)

### Where
`humanityProtocol.ts:107-136`, `:198-225`, `routes/humanity.ts:182-198`, `:393-409`.

### Why it's wrong

Every call site has the same shape:

```ts
if (results?.errors?.length > 0) {
    isVerified = true; score = 85;          // branch A: insecure fallback
} else if (results?.results && Array.isArray(results.results)) {
    // branch B: tries result.preset === 'isHuman' || 'is_human'
    //           reads result.credential.credentialSubject.is_human
} else {
    // branch C: reads results.is_human.verified
    //           or results.is_human.credential.credentialSubject.is_human
}
```

Branches B and C are guessing at three mutually exclusive shapes, none of which match the SDK's actual response. The real shape, from `connect-sdk/src/adapters/presets.adapter.ts:8-32`:

```ts
export interface PresetCheckResult {
  preset: DeveloperPresetKey;     // camelCase developer key, e.g. 'isHuman'
  presetName: string;             // snake_case wire name, e.g. 'is_human'
  scope: string;
  value: boolean;                 // ← the actual answer
  status: PresetStatus;           // 'active' | 'expired' | 'revoked' | 'pending'
  expiresAt: string;
  verifiedAt?: string;
  evidence?: Record<string, unknown>;
}

export interface PresetBatchResult {
  results: PresetCheckResult[];
  errors:  PresetErrorResult[];
  raw:     PresetsVerifyResponse;
}
```

So:
- There is no `result.verified` (branch C reads it; always `undefined`).
- There is no `result.credential.credentialSubject.is_human` (branch B reads it; the SDK never exposes the raw VC at that path — only `evidence`).
- Even after pending #1 and #2 land, branches B and C would still read `undefined`, fall through to the defaults, and re-trigger the "verified by default" bug.

### Prompt to fix with AI

```prompt
Files:
  - server/services/humanityProtocol.ts
  - server/routes/humanity.ts

The four call sites that parse sdk.verifyPresets() responses use three
"guessed" fallback branches, all using `as any`, none matching the real
SDK type. The real shape is exported as PresetBatchResult /
PresetCheckResult from
@humanity-org/connect-sdk/dist/adapters/presets.adapter.d.ts:

  PresetBatchResult = {
    results: PresetCheckResult[];
    errors:  PresetErrorResult[];
    raw; rateLimit?;
  }
  PresetCheckResult = {
    preset; presetName; scope;
    value: boolean;       // ← read from here
    status;               // ← 'active' | 'expired' | 'revoked' | 'pending'
    expiresAt; verifiedAt?; evidence?; rateLimit?;
  }

There is no `verified` field. There is no `credential.credentialSubject.*`
path. The boolean answer lives at `result.value`.

Please:

1. Import PresetBatchResult and PresetCheckResult from
   @humanity-org/connect-sdk at the top of each file. Remove every
   `as any` cast on verifyPresets results.
2. Replace the three-branch parser at every call site with a single
   typed read:
       const byName = new Map(results.results.map(r => [r.presetName, r]));
       const isHuman      = byName.get('is_human')?.value === true;
       const palmVerified = byName.get('palm_verified')?.value === true;
   Refuse the request if results.errors.length > 0.
3. Also assert r.status === 'active' before treating r.value as truthy.
   PresetStatus can be 'expired' | 'revoked' | 'pending', and
   error code E4010 specifically calls out 24-hour expiry.
4. Delete every read of humanityScore from the response — it does not
   exist as a preset in this SDK version (see Pending #2).

Do not touch OAuth/state code in this commit.
```

---

## Pending #4 — `<HumanityProfile>` reads a field that doesn't exist (severity: low)

### Where
`client/src/components/creators/HumanityStatus.tsx:101`

```tsx
<HumanityProfile variant="card" showFields={['name', 'humanity_score']} showAvatar={true} showBadges={true} />
```

### Why it's wrong

`humanity_score` is not a real preset in this SDK version (Pending #2). `HumanityProfile` will render the field empty / undefined. Cosmetic, but misleading — it suggests there's a humanity_score being returned when there isn't.

### Prompt to fix with AI

```prompt
File: client/src/components/creators/HumanityStatus.tsx around line 101

The <HumanityProfile> component is rendering a humanity_score field
that doesn't exist as a preset in the installed @humanity-org/connect-sdk
version. The valid presets in this SDK are listed in
node_modules/@humanity-org/connect-sdk/dist/utils/ts-types/presets.* —
humanity_score is not among them.

Please:

1. Remove 'humanity_score' from showFields. Use ['name'] for now.
2. Render the score from the backend response (status.score from
   useQuery(['humanity-status', creatorId])) in a sibling element
   instead — that's a server-derived score, not a real preset, so
   showing it as one is misleading.
3. Add a code comment noting why we don't use HumanityProfile for the
   score: "Score is computed server-side from is_human + palm_verified
   presets (see server/services/humanityProtocol.ts), not returned by
   the SDK as a single preset."

No backend changes.
```

---

## Pending #5 — secondary OAuth/state findings (severity: medium, follow-up PR)

These are real bugs but separate from the "wrong context" theme. Each gets one prompt block.

### 5a. State is a userId payload, not a CSRF token

`humanityProtocol.ts:71-73` packs userId into a base64 JSON blob and sends it as `state`. That conflates routing-the-callback with CSRF defence.

```prompt
File: server/services/humanityProtocol.ts (getAuthUrl) and server/routes/humanity.ts (callback)

State is currently being used as a userId payload (base64-encoded JSON
with userId inside). That conflates two separate concerns:
  - routing the callback to the right user (server-side concern)
  - CSRF defence (random nonce, single-use, validated)

The SDK provides HumanitySDK.generateState() and HumanitySDK.verifyState()
specifically for the CSRF concern. Please:

1. Generate state with HumanitySDK.generateState() in getAuthUrl.
2. Server-side, store a row keyed by state with: { userId, codeVerifier,
   createdAt, used: false }. Use a short TTL (5 minutes) and mark used
   after the first callback consumes it.
3. In the callback handler, look up state in that store, validate with
   HumanitySDK.verifyState(stored, received), then read userId from the
   stored row — never from the state value itself.
4. Pass state via the typed `state` field of buildAuthUrl, NOT via
   additionalQueryParams.state. The latter works today by coincidence
   and would break if the SDK starts disallowing reserved-param overrides.

Add a brief comment explaining the new flow above getAuthUrl.
```

### 5b. PKCE codeVerifier returned to the frontend

`routes/humanity.ts:88` returns the codeVerifier in the auth-url response. The SDK's own README says: *"The PKCE code verifier should be stored in a server session, not client storage."*

```prompt
File: server/routes/humanity.ts (the GET /api/humanity/auth-url/:userId handler)

Right now we return the PKCE codeVerifier to the frontend so the
frontend can pass it back during the callback. This is wrong — the
SDK README explicitly says codeVerifier must stay server-side.

Please:

1. Stop returning codeVerifier in the auth-url response.
2. Store codeVerifier server-side in the same store you set up for
   state (Pending #5a's prompt). Key both by state.
3. In the callback handler, look up { userId, codeVerifier } by state
   and pass codeVerifier to sdk.exchangeCodeForToken from the stored
   row. The frontend never sees it.

This depends on the state store from #5a, so do them in the same PR.
```

### 5c. Frontend-supplied `humanityId` is trusted as a unique key

`routes/humanity.ts:153` accepts `humanityId` from the request body and uses it at line 281 as the unique key for `creators.humanityCredentialId`. A malicious client can claim any humanityId and inherit another user's `creators` row.

```prompt
File: server/routes/humanity.ts (POST /api/humanity/login handler)

The handler accepts humanityId from the request body and uses it as
the unique key when looking up or creating a `creators` row. This is
a trust-boundary bug — a malicious client can claim any humanityId
and take over another user's creator account.

Please:

1. Remove humanityId from the request body schema entirely.
2. Derive the unique identifier from the access token server-side. The
   connect-sdk does not expose userinfo directly, but the token's
   `sub` claim (or the result of /v2/userinfo if you call it via the
   SDK's connection) contains an opaque, app-scoped subject ID that's
   safe to use as the creators.humanityCredentialId.
3. Add a server-side assertion: if the derived ID differs from any
   value the frontend tries to send, reject the request with 400.

This is a security bug — please prioritise it after Pending #1, #2, #3.
```

---

## Suggested rollout order

| Order | Issue                                | Why this order                                                                                         |
|-------|--------------------------------------|--------------------------------------------------------------------------------------------------------|
| 0     | **This PR** — Provider + init wedge  | Without these, none of the other fixes are even reachable.                                              |
| 1     | Pending #1 (frontend scopes)          | Smallest possible follow-up. Fixes the "every login grants verification" bug at the source.            |
| 2     | Pending #2 + #3 (preset names + parser shape) | These are the same code paths; reviewing them separately is double work. Land behind a feature flag if you want to ship cautiously. |
| 3     | Pending #5a + #5b (state + PKCE)      | Same store, same PR.                                                                                   |
| 4     | Pending #5c (humanityId trust boundary) | Security bug. Should not wait long after #2.                                                          |
| 5     | Pending #4 (HumanityProfile cosmetic) | Pure cleanup — do anytime after #2.                                                                    |

Until at least items 1, 2, 3 land, the biometric multiplier in `WPTHumanRewards.sol` is multiplying rewards by a number that does not reflect biometric reality.
