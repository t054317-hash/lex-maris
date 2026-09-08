# LEX MARIS — Architecture

Commercial law, corporate contract automation and maritime trade legalities.

This document covers the decisions a reader cannot infer from the code: why the
boundaries sit where they do, and what breaks if they move.

---

## 1. Shape of the system

```
                    ┌──────────────────────────────┐
   Browser ───────► │ Next.js 14 (App Router)      │
                    │  · RSC for content + SEO     │
                    │  · Client islands: 3D intro, │
                    │    matrix canvas, wizard     │
                    │  · BFF route handlers only   │
                    └───────────┬──────────────────┘
                                │ JWT (HTTP-only cookie) + CSRF token
                    ┌───────────▼──────────────────┐
                    │ NestJS API (REST + WS)       │
                    │  matters · documents ·       │
                    │  risk · signature · audit    │
                    └──┬────────┬────────┬─────────┘
                       │        │        │
              ┌────────▼──┐ ┌───▼────┐ ┌─▼──────────────┐
              │PostgreSQL │ │ Redis  │ │ Object store   │
              │ (Prisma)  │ │ cache  │ │ (ciphertext)   │
              └───────────┘ │ + pub/ │ └────────────────┘
                            │ sub    │        ▲
                            └────┬───┘        │
                                 │      ┌─────┴──────┐
                            ┌────▼────┐ │ KMS        │
                            │ Worker  │ │ (key wrap) │
                            │ PDF/sig │ └────────────┘
                            └─────────┘
```

**Why a separate NestJS API rather than Next.js route handlers alone.**
Document sealing, PDF rendering and signature attestation are long-running,
CPU-bound and hold key material. Running them inside the same process that
serves React means a rendering spike starves page loads, and it puts KMS
credentials in the same blast radius as the SSR layer. Next.js route handlers
act only as a BFF: session exchange, CSRF, and proxying to the API.

**Framework choice.** NestJS over Express for the module/DI structure — this
domain has a lot of cross-cutting concern (audit, authorisation, tenancy) and
interceptors express that better than middleware chains. FastAPI would be the
right call instead if the roadmap adds ML clause extraction; it does not today.

---

## 2. The risk engine is shared, not duplicated

`src/lib/risk-engine.ts` is pure, dependency-free TypeScript. It is imported by:

- the browser, for the live scanner preview
- the API, for the authoritative score written to `RiskReport`

**The client score is advisory; the server score is the record.** Only the
server writes `RiskReport`, and every report carries `modelVersion`. Band
thresholds are fixed constants: tuning them without bumping
`SCORE_MODEL_VERSION` silently invalidates every historical comparison in the
portfolio view. That is the one change in this file that is not safe.

Rules that do not apply to a contract type are removed from the denominator as
well as the numerator, so a clean charterparty and a clean supply agreement both
score 0 — scores are comparable across instrument types.

---

## 3. Document custody

Sealing lives in `src/lib/document-crypto.ts`. Threat model: **assume the object
store and the database are both readable by an attacker who has not compromised
the KMS.**

| Concern | Decision |
| --- | --- |
| Cipher | AES-256-GCM. Authenticated — tampering fails at decrypt, not downstream. |
| Key hierarchy | Per-document data key, wrapped by a KMS master key. Only the wrapped form is persisted. |
| Nonce | 96-bit random per document. Never reused: a fresh data key per document means nonce collision is not a practical risk. |
| Plaintext | Never written to disk, never logged. Buffers zeroed after use (best-effort — Node gives no guarantee against GC copies). |
| Content identity | SHA-256 of plaintext. Public, and the QR payload. |
| Swapped-row defence | `openDocument` re-checks the content hash, catching a valid blob paired with the wrong DB row. |

`createLocalKeyWrapper` throws if `NODE_ENV === 'production'`. Deploy a
KMS-backed `KeyWrapper` (AWS KMS, GCP KMS or Vault Transit).

### Signatures are attestations, not PKI

There is no client-side private key. A signature is an **HMAC attestation by the
platform** that a specific content hash was accepted by an authenticated
principal at a specific time. This is a real, defensible evidentiary record —
but it is *not* a digital signature under an eIDAS-qualified scheme, and the
verification page must say so in those words. Do not let product copy imply
otherwise.

The QR verification URL carries only the content hash — no matter id, no party
names — so a leaked printout discloses nothing about the deal.

---

## 4. Authentication

- **Access token**: JWT, 15-minute expiry, `HttpOnly; Secure; SameSite=Lax`
  cookie. Never in `localStorage` — an XSS then reads it.
- **Refresh token**: opaque, hashed at rest, rotated on every use, grouped into
  a *family*. Presenting a retired token revokes the entire family. That is the
  standard detection for a stolen refresh token.
- **CSRF**: double-submit token, required on every non-idempotent request.
  `SameSite=Lax` alone is not sufficient for a platform that will eventually be
  embedded.
- **MFA**: TOTP mandatory for `PARTNER`, `COMPLIANCE` and `ADMIN`. The secret is
  stored encrypted (`User.totpSecretEnc`).
- **Passwords**: Argon2id. Not bcrypt — memory-hardness matters here.

---

## 5. Real-time

`Socket.io` over the API, one room per matter (`matter:{id}`), authorised on
connect against the same JWT. Redis pub/sub is the adapter so any API instance
can broadcast.

Events are **notifications, not state**: `matter.stage.changed` carries the new
stage and a revision number, and the client refetches. Pushing full state over
the socket means two code paths that can disagree about the same matter, and the
socket path is the one without tests.

---

## 6. Front-end performance contract

The 60 FPS target is an obligation, not an aspiration. Concretely:

- **three.js is code-split and client-only** (`next/dynamic`, `ssr: false`).
  A user who skips the intro must never download it. This is the single largest
  bundle decision in the app.
- **Intro shows once per session** (`sessionStorage`) and never under
  `prefers-reduced-motion`.
- **Primitive geometry only** in the gavel scene — no glTF, no post-processing,
  three lights. `dpr` capped at 1.6.
- **Matrix canvas** is O(n²) in edge testing, bounded by a hard 90-node cap, so
  frame cost is flat regardless of viewport. DPR clamped to 2.
- **Every render loop suspends** when scrolled out of view (`IntersectionObserver`)
  or when the tab is hidden (`visibilitychange`).
- **Cursor follower writes `style.transform` directly** inside one rAF loop.
  A `setState` per `pointermove` would re-render the tree ~120×/s.
- **Wizard derivations are `useMemo`'d** pure functions (~12 rule evaluations
  plus one map), which is why no web worker is needed.

### Accessibility, specifically

The cinematic layer is decorative and must never be load-bearing:

- Intro is keyboard-operable (Enter/Space strikes, Escape skips) with a visible
  Skip control.
- Custom cursor is disabled for coarse pointers and for reduced-motion users,
  which restores the native cursor via `body[data-custom-cursor]`.
- Audio fires only inside a user gesture (browser autoplay policy) and the intro
  is fully functional with no `AudioContext` at all.
- The risk score is announced through `aria-live`, so the real-time signal is
  not sight-only.
- Skip-to-content link, visible focus rings, and `prefers-reduced-motion`
  handled in both CSS and JS.

---

## 7. Data model notes

Full schema in [`prisma/schema.prisma`](../prisma/schema.prisma).

- **Money is `Decimal`, never `Float`.**
- **Nothing is hard-deleted.** `deletedAt` drives visibility; legal records must
  outlive a deletion request for the retention period.
- **`AuditEvent` is append-only.** Enforce it at the database role: grant the
  application `INSERT` and `SELECT` only. An application-layer convention will
  eventually be bypassed by a migration script.
- **`RiskReport.findings` is denormalised JSON on purpose.** A report is an
  immutable snapshot, not a mutable worklist. Normalising findings into rows
  invites someone to "just update" one.
- **Document ciphertext is not in Postgres** — only sealing metadata. A database
  dump on its own reveals no document content.

---

## 8. Deliberate omissions

Named so nobody assumes they were forgotten:

- **No clause extraction from uploaded PDFs.** The engine scores structured
  input. Parsing arbitrary third-party drafts is an ML problem and a separate
  project.
- **No multi-region write.** Single primary with read replicas. Document
  residency requirements would change this materially.
- **No e-signature vendor integration.** The attestation model above is
  self-contained. If a qualified eIDAS signature is required, that is a vendor
  (DocuSign/Adobe) integration, not a change to this code.
- **Arabic RTL is scaffolded, not complete.** The type stack and `dir` switch
  are in place; the content layer and mirrored layouts are not.
