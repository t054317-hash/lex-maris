# LEX MARIS

LegalTech platform for commercial law, corporate contract automation and
maritime trade legalities. Dark, gold-accented, glassmorphic interface over a
deterministic clause-level risk engine.

> **Not legal advice.** The risk engine produces a triage signal for a qualified
> practitioner. The signature model is a platform attestation, not an
> eIDAS-qualified digital signature. Both points are stated in the UI and must
> stay stated.

## Two ways in

**`prototype/lex-maris-bench.html`** is a single self-contained file — open it in
a browser, no toolchain. It carries the whole experience (3D gavel intro,
synthesised strike, particle burst, spotlight cursor, reactive matrix mesh, the
live builder and the matter rail) in plain JS, and is the fastest way to review
the design. It ports the same rule set and clause tree as the modules below;
when you change a rule in `src/lib/`, port it there too or drop the prototype.

**The Next.js app** is the production path.

> **Status:** `npm run typecheck` and `next build` pass.

## Languages

English, Arabic (RTL) and French. The header toggle switches **everything**:
chrome, every select option, risk findings, the dashboard, and the generated
contract itself, which is drafted clause by clause in the chosen language
(`src/lib/document-engine.ts` holds one complete text table per locale). UI
strings live in `src/i18n/dictionaries.ts`; finding translations in
`src/i18n/findings.ts`, keyed by `Finding.code`. The engine's English finding
text remains the audit record. A native legal reviewer should read the Arabic
and French contract text before either is used for an executed instrument.

## Quick start

```bash
npm install
cp .env.example .env
npm run typecheck   # run this first — see status note above
npm run dev
```

Open http://localhost:3000. The intro fires once per browser session — clear
`sessionStorage` (or open a private window) to see it again.

Database work is optional for the front end; the dashboard renders from
fixtures. To bring up Postgres:

```bash
npm run db:generate && npm run db:migrate
```

## Layout

```
src/
├── app/
│   ├── layout.tsx              Fonts, metadata, security headers, cursor mount
│   ├── page.tsx                Landing (RSC) — hero, capabilities, builder
│   ├── dashboard/page.tsx      Client dashboard — timeline, alerts, vault
│   └── globals.css             Glass surfaces, tokens, motion opt-out
├── components/
│   ├── intro/
│   │   ├── GavelIntro.tsx      Orchestrates strike → sound → burst → dissolve
│   │   ├── GavelScene.tsx      R3F scene; primitive geometry, capped dpr
│   │   ├── ParticleBurst.tsx   2D-canvas golden collision spray
│   │   └── useGavelAudio.ts    Synthesised strike — no audio asset shipped
│   ├── ui/
│   │   ├── CursorSpotlight.tsx Glowing ring cursor, single rAF loop
│   │   ├── LegalMatrixCanvas.tsx  Pointer-reactive node mesh
│   │   └── GlassCard.tsx       The one glass surface primitive
│   ├── wizard/
│   │   ├── ContractWizard.tsx  5-step builder; two panes, one state atom
│   │   ├── RiskMeter.tsx       SVG exposure dial, aria-live
│   │   ├── FindingsList.tsx    Collapsible findings register
│   │   └── DocumentPreview.tsx Live draft on a light paper surface
│   └── dashboard/
│       └── ContractTimeline.tsx  Parcel-tracking-style matter rail
├── hooks/                      useReducedMotion, useIsVisible
└── lib/
    ├── theme.ts                Tokens for canvas / WebGL / PDF consumers
    ├── risk-engine.ts          Pure scoring rules — shared client + server
    ├── document-engine.ts      Declarative clause assembly
    └── document-crypto.ts      AES-256-GCM sealing, HMAC attestation (server)
```

## The two things worth understanding first

**The risk engine and the document engine are both pure functions of the same
input.** That is what makes the live preview trustworthy: the draft a client
approves in the browser is assembled by the identical code the server renders to
PDF. If you add a term, add it to `ContractInput` and both engines pick it up.

**Everything cinematic is decorative and degrades.** The intro, cursor, matrix
mesh and particle burst all disappear under `prefers-reduced-motion`, on coarse
pointers, or with no `AudioContext` — and the app remains fully operable. Keep
it that way; the moment the 3D layer becomes load-bearing, the platform stops
being usable for a chunk of its audience.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `navy-900` | `#0A1128` | Page ground |
| `navy-800` | `#101A3A` | Glass fill base |
| `gold-500` | `#D4AF37` | Accent, borders, dial |
| `gold-400` | `#E7C765` | Highlight, impact light |
| `ink-100` | `#F3F5FA` | Body text |
| `ink-500` | `#8B93A8` | Secondary text |

Type: Cinzel (English display), Inter (English body), Tajawal (Arabic).
Tokens live in `tailwind.config.ts` and are mirrored in `src/lib/theme.ts` for
canvas and WebGL consumers, which cannot read Tailwind classes.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — back-end boundaries, key
hierarchy and threat model, auth token strategy, real-time contract, the
performance obligations above, and a list of deliberate omissions.
