# Humanity Connect SDK integration review

> **Status:** draft / guidance only — no code changes in this PR.
> **Scope:** how `@humanity-org/connect-sdk` is wired up in `server/services/humanityProtocol.ts` and `server/routes/humanity.ts`.
> **Theme:** _wrong context handed to the SDK_. Every painful bug below traces back to the SDK being given inputs it doesn't understand, then the integration silently masking the failure by granting verification anyway.

This document is intentionally **a review, not a fix**. Each issue ends with a copy-pasteable prompt you can hand to your own coding AI to drive the change yourself. Apply them one at a time and verify against the SDK source before merging.

---

## TL;DR — the user-visible consequence

Right now, in every realistic code path:

- The SDK constructor **throws silently** (caught and swallowed, leaving `this.sdk = null`).
- Even when it doesn't throw, the presets you request **do not exist** in the installed SDK version.
- When preset verification errors, the integration falls through to:
  ```ts
  isVerified = true;
  score = 85;
  ```
  in five separate places (`humanityProtocol.ts:110`, `:201`, `routes/humanity.ts:184`, `:202`, `:395`, `:412`).

**Net effect: any user who completes the OAuth round-trip is treated as a verified human with a non-trivial score, regardless of whether they scanned a palm.** The biometric multiplier described in `ARCHITECTURE_OVERVIEW.md` § Phase 3 is not actually gated on biometric verification.

That is the headline finding. The three sections below are the three reasons it happens.

---

## 1. `environment: 'sandbox'` is not a valid value (severity: critical)

### Where
`server/services/humanityProtocol.ts:53`

```ts
this.sdk = new HumanitySDK({
  clientId: HUMANITY_CLIENT_ID,
  clientSecret: HUMANITY_CLIENT_SECRET,
  redirectUri: HUMANITY_REDIRECT_URI,
  environment: 'sandbox', // ← not a known environment
});
```

### Why it's wrong
The SDK only registers three environments. From `connect-sdk/src/internal/environment.ts`:

```ts
export type EnvironmentName = 'production' | 'staging' | 'testnet';

const DEFAULT_ENVIRONMENTS: Record<EnvironmentName, EnvironmentDescriptor> = {
  production: { ... apiBaseUrl: 'https://api.humanity.org' ... },
  staging:    { ... apiBaseUrl: 'https://api-staging.humanity.org' ... },
  testnet:    { ... apiBaseUrl: 'https://api-testnet.humanity.org' ... },
};
```

`EnvironmentRegistry.resolve()` throws `Unknown Humanity SDK environment "sandbox"` for anything else. That throw happens inside your `try { … } catch` block, so:

- `this.sdk` stays `null`.
- The startup log says `🔴 Failed to initialize Humanity SDK` — easy to miss in dev because the server boots fine.
- Every endpoint then either bails with `"SDK not initialized"` or, in the `/login` and `/sync` routes, falls into the `isVerified = true; score = 85` fallback.

### Why this is the root cause
Once the SDK is `null`, **none of the other bugs below ever get exercised**. So fixing the env unblocks discovery of #2 and #3, which is also why this is listed first.

### Acceptance criteria for the fix
- The constructor must succeed with a value the SDK actually recognises (`testnet` for the dev grant build, per `ARCHITECTURE_OVERVIEW.md` § Technology Stack).
- Boot log must show `🟢 Humanity SDK initialized successfully` in dev.
- A failed init must hard-fail server startup, not be swallowed — see prompt below.

### Prompt to hand to your AI

```
File: server/services/humanityProtocol.ts

The HumanitySDK constructor is being called with environment: 'sandbox',
but the @humanity-org/connect-sdk package only accepts
'production' | 'staging' | 'testnet' (see node_modules/@humanity-org/connect-sdk
/dist/internal/environment.* — DEFAULT_ENVIRONMENTS). Anything else throws
"Unknown Humanity SDK environment …", and our try/catch silently swallows it,
leaving this.sdk = null and forcing every downstream route into a
"isVerified = true, score = 85" fallback that grants verification to
unverified users.

Please:

1. Replace 'sandbox' with the value driven by an env var
   HUMANITY_ENVIRONMENT (default 'testnet'). Add it to .env.example with
   the comment "production | staging | testnet".
2. Validate the value at startup. If it isn't one of the three, throw and
   exit — do NOT silently continue with this.sdk = null.
3. Remove the surrounding try/catch around `new HumanitySDK(...)` so init
   failures crash the process. A misconfigured identity SDK must not boot
   into a degraded "everyone is verified" state.
4. Add a one-line console.log on success showing which environment is in
   use, so this is visible in deploy logs.

Do not touch any other file in this PR.
```

---

## 2. Most of the presets being requested don't exist in this SDK version (severity: critical)

### Where
- `server/services/humanityProtocol.ts:104` (`['is_human', 'humanity_score']`)
- `server/services/humanityProtocol.ts:183-195` (the eleven-preset list)
- `server/routes/humanity.ts:174` and `:390` (`['is_human', 'humanity_score']`)

### Why it's wrong
The SDK's authoritative preset list lives in `connect-sdk/src/utils/ts-types/presets.ts:28`:

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

Of the presets the integration requests, only **`is_human`** is in this list. Every other preset — `humanity_score`, `social_accounts`, `email`, `google_connected`, `twitter_connected`, `facebook_connected`, `linkedin_connected`, `github_connected`, `discord_connected`, `telegram_connected` — is **rejected by the API** and lands in `PresetBatchResult.errors[]`.

The README at the top of the npm package lists more presets (`humanity_score`, `email`, `social_accounts`, etc.). That README is **ahead of the actual code shipped in this SDK version** — it describes a future surface. Trust the type definitions, not the README.

### How this combines with the fallback
In `routes/humanity.ts:182-185`:

```ts
if (results?.errors && results.errors.length > 0) {
    console.warn("🟡 [BACKEND] Presets returned errors (likely due to sandbox scope limits):", results.errors);
    isVerified = true;
    score = 85;
}
```

So when the API returns errors for the nonexistent presets, you treat the user as verified at score 85. This is the actual production behaviour today, not just an edge case — it fires on every login because the preset list is wrong, not because of "sandbox scope limits". The comment is misdiagnosing the cause.

### Acceptance criteria for the fix
- Only request presets that exist in the SDK's `PresetName` union.
- If a preset returns an error, **do not grant verification**. Either propagate the error to the caller or refuse the login.
- The `humanityScore` field in the database must come from a real source. In this SDK version, there is no preset that returns a numeric score — derive it server-side from `palm_verified` + `is_human` (e.g. `palm_verified: true → 95`, `is_human: true → 60`, neither → reject), and write that policy down in code comments.

### Prompt to hand to your AI

```
Files:
  - server/services/humanityProtocol.ts
  - server/routes/humanity.ts

The integration calls sdk.verifyPresets({ presets: [...] }) with preset
names that do not exist in @humanity-org/connect-sdk's PresetName union
(see node_modules/@humanity-org/connect-sdk/dist/utils/ts-types/presets.*).
The valid set in this SDK version is exactly:
  is_human, is_18_plus, is_21_plus, is_accredited_investor,
  is_qualified_purchaser, is_institutional_investor, palm_verified,
  age_gate_alcohol, age_gate_gambling, investment_gate.

The current code requests humanity_score, social_accounts, email, and a
bunch of *_connected presets that simply do not exist. The API rejects
them, the SDK puts the rejections into result.errors[], and our code then
sets isVerified = true; score = 85, granting verification to unverified
users.

Please:

1. Replace every verifyPresets call with: { presets: ['is_human', 'palm_verified'] }.
2. Delete the preset names that don't exist (humanity_score, social_accounts,
   email, *_connected) and any UI that depends on them — flag those UI
   usages in the PR description for follow-up, do not leave dead reads.
3. Compute humanityScore server-side from the two real presets, using this
   policy (write it as a const ladder with a code comment explaining the
   reasoning):
       palm_verified === true → 95
       is_human === true      → 60
       neither                → 0  (and isVerified = false)
4. If verifyPresets returns any entry in result.errors[], throw — do NOT
   set isVerified = true. The current "score = 85 on errors" branch is
   the security bug we are fixing.
5. Add a TODO comment near the score ladder noting that when the SDK
   exposes a real humanity_score preset, this should be replaced.

Do not touch OAuth/state/CSRF code in this commit — that is a separate change.
```

---

## 3. The response is parsed via three guessed fallback branches (severity: high)

### Where
`server/services/humanityProtocol.ts:107-136`, `:198-225`, `routes/humanity.ts:182-198`, `:393-409`.

### Why it's wrong
Each call site has the same shape:

```ts
if (results?.errors?.length > 0) {
    isVerified = true; score = 85;          // ← branch A: insecure fallback
} else if (results?.results && Array.isArray(results.results)) {
    // ← branch B: tries result.preset === 'isHuman' || 'is_human',
    //   reads result.credential.credentialSubject.is_human
} else {
    // ← branch C: reads results.is_human.verified
    //   or results.is_human.credential.credentialSubject.is_human
}
```

Branches B and C are guessing at three mutually exclusive shapes. The real shape is single and documented in `connect-sdk/src/adapters/presets.adapter.ts:8-32`:

```ts
export interface PresetCheckResult {
  preset: DeveloperPresetKey;     // camelCase developer key, e.g. 'isHuman'
  presetName: string;             // snake_case wire name, e.g. 'is_human'
  scope: string;
  value: boolean;                 // ← this is the answer
  status: PresetStatus;           // 'active' | 'expired' | 'revoked' | 'pending'
  expiresAt: string;
  verifiedAt?: string;
  evidence?: Record<string, unknown>;
  rateLimit?: RateLimitInfo;
}

export interface PresetBatchResult {
  results: PresetCheckResult[];
  errors:  PresetErrorResult[];
  raw:     PresetsVerifyResponse;
  rateLimit?: RateLimitInfo;
}
```

So:

- There is no `result.verified` (your branch C reads it; it's always `undefined`).
- There is no `result.credential.credentialSubject.is_human` (your branch B reads it; the SDK never exposes the raw VC payload at that path — only `evidence`).
- `presetName` is `is_human` (snake), `preset` is `isHuman` (camel). Comparing both, as the code does, masks the fact that you don't know which one to use.

This means even **after** fixing #1 and #2, the ladder you'd derive a score from would silently always read `undefined`, and you'd fall through to the same insecure fallback.

### Acceptance criteria for the fix
- Exactly one parsing branch.
- Use the typed surface (`PresetBatchResult`, `PresetCheckResult`) — drop every `as any`.
- Match by `presetName` (the wire name), since that is what `result.errors[]` also keys on.
- Read the boolean from `.value`. There is no other place to read it from.

### Prompt to hand to your AI

```
Files:
  - server/services/humanityProtocol.ts
  - server/routes/humanity.ts

The four call sites that parse sdk.verifyPresets() responses currently
have three "guessed" fallback branches, all using `as any`, none of which
matches the real SDK type. The real shape is exported as
PresetBatchResult / PresetCheckResult from
@humanity-org/connect-sdk/dist/adapters/presets.adapter.d.ts:

  PresetBatchResult  = { results: PresetCheckResult[]; errors: PresetErrorResult[]; raw; rateLimit?; }
  PresetCheckResult  = { preset; presetName; scope; value: boolean; status; expiresAt; verifiedAt?; evidence?; rateLimit?; }

There is no `verified` field. There is no `credential.credentialSubject.*`
field. The boolean answer lives at `result.value`.

Please:

1. Import the types from @humanity-org/connect-sdk at the top of each file
   and remove every `as any` cast on the verifyPresets result.
2. Replace the three-branch parser at every call site with a single
   typed read:
       const byName = new Map(results.results.map(r => [r.presetName, r]));
       const isHuman      = byName.get('is_human')?.value === true;
       const palmVerified = byName.get('palm_verified')?.value === true;
   And refuse the request if `results.errors.length > 0`.
3. Also assert `r.status === 'active'` before treating r.value as truthy —
   PresetStatus can be 'expired' | 'revoked' | 'pending', and the README
   error code E4010 specifically calls out 24-hour expiry.
4. Delete the `humanityScore` parsing entirely (the preset doesn't exist
   in this SDK version — see review section #2).

Do not touch OAuth/state code in this commit.
```

---

## Secondary findings (out of scope for "context", but worth a follow-up PR)

These are real bugs, but they're not in the "wrong context handed to the SDK" theme. Listing them so they don't get lost:

- **State is not a CSRF token, it's a userId payload.** `humanityProtocol.ts:71-73` packs `userId` into a base64-encoded JSON blob and sends it as `state`. That conflates two concerns: routing the callback (server-side) and CSRF defence (random nonce, single-use). Generate state with `HumanitySDK.generateState()`, store it server-side keyed by session, and validate with `HumanitySDK.verifyState()` on the callback. Keep the userId mapping separate.
- **State is passed via `additionalQueryParams`**, not the typed `state` field on `buildAuthUrl`. It happens to work because `additionalQueryParams.state` overwrites the URL param, but it's a footgun — the next SDK version could disallow overriding reserved OAuth params.
- **Missing `nonce`.** `buildAuthUrl` accepts a `nonce` for ID-token replay protection. Not generated, not validated.
- **`codeVerifier` is returned to the frontend** (`routes/humanity.ts:88`). The SDK's own README explicitly says "PKCE code verifier should be stored in a server session, not client storage". Move it to a session/cookie keyed by state.
- **`/api/humanity/login` accepts a frontend-supplied `humanityId`** (`routes/humanity.ts:153`) and uses it as the unique key for `creators.humanityCredentialId` (`routes/humanity.ts:281`). A malicious client can claim any humanityId and inherit another user's `creators` row. Derive the unique identifier from the `accessToken` server-side via the SDK, never from the request body.
- **Two parallel verification stacks** (`@humanity-org/connect-sdk` _and_ `@humanity-org/react-sdk`) both write `creators.isHumanityVerified`. Pick one source of truth; the other becomes a UI shell.

Each of these deserves its own PR after the three core context bugs are fixed.

---

## Suggested rollout order

1. **PR 1 — environment.** Section #1 above. Smallest possible diff. Verifies in deploy logs that the SDK is actually initialising.
2. **PR 2 — preset names + response shape.** Sections #2 and #3 together; they're the same code paths and reviewing them separately doubles the work. Land behind a feature flag if you want to ship cautiously.
3. **PR 3 — OAuth state / CSRF / PKCE storage.** Secondary findings list, top three bullets.
4. **PR 4 — humanityId trust boundary.** Secondary list, fourth bullet. This one is also a security issue and shouldn't wait too long.

Until at least PR 1 + PR 2 land, the biometric multiplier in `WPTHumanRewards.sol` is multiplying rewards by a number that does not reflect biometric reality.
