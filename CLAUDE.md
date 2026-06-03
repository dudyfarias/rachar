# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in browser

npm test               # Vitest (unit tests)
npm run typecheck      # tsc --noEmit
npm run docs:check     # Validate doc coverage
```

Run `npm test && npm run typecheck && npm run docs:check` before closing any sprint or opening a PR.

## Architecture

Feature-based modular structure. UI, state, services, and database are decoupled by design.

```
src/
  app/                   Global providers
  components/ui/         Reusable design system (Button, Input, Card, Header, Loading, Modal, BottomSheet)
  features/
    auth/screens/        Onboarding, Login, Cadastro
    bills/screens/       Home, Nova Conta, Pessoas, Itens, Resultado
    receipts/screens/    Captura, Processamento, Conferencia
    social/screens/      Social e Pix
  lib/                   Currency helpers, IDs, Supabase client
  navigation/            RootNavigator and stacks
  services/
    billing/             calculateSplits.ts — financial engine (pure function)
    receipts/            OCR + AI pipeline (receiptOcr.ts, receiptParser.ts)
    social/              WhatsApp summary, Pix gateway, analytics
  stores/                Zustand global state
  theme/                 Visual tokens
  types/                 Shared TypeScript contracts
supabase/migrations/     Versioned database schema
docs/                    Living documentation per sprint and area
```

### Financial Engine

`src/services/billing/calculateSplits.ts` takes a `BillDraft` and returns a `SplitSummary`. Rules:
- Items split only among their assigned participants.
- Service fee and discount are proportional to each person's subtotal.
- Cent-level rounding uses deterministic remainder distribution.
- **All monetary values are integers in cents — never floats.**

### Zustand Stores

| Store | Responsibility |
|---|---|
| `appStore` | Onboarding state and preferences |
| `authStore` | Session, user, login/signup/logout, demo mode |
| `billStore` | Current bill draft (manual flow) |
| `receiptStore` | Capture, OCR, AI parsing, and review pipeline |
| `socialStore` | Pix profile, history, recent friends, recurring groups, analytics |

### OCR / AI Pipeline

`receiptOcr.ts` calls `EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT` when set, or falls back to a demo provider. `receiptParser.ts` normalizes the response to cents, validates totals, and adds review warnings. OCR/AI must never run in the client with real keys — use Edge Functions for production.

### Supabase

Auth uses AsyncStorage, autoRefreshToken, persistSession, detectSessionInUrl: false, and processLock. RLS is mandatory on every table — policies are owner-based (`auth.uid()`). Never expose `service_role` in the app; use only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Bills with `share_token` can be read by anonymous users via the `x-share-token` header.

## Key Conventions

- Screens orchestrate state and components; they do not contain financial logic.
- Reuse existing UI components from `src/components/ui` before creating new ones.
- Prefer NativeWind and project tokens over inline styles.
- New features must update `docs/`, the corresponding `docs/sprint-*.md`, and `CHANGELOG.md`.
- Semantic commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Expo SDK 56 — consult versioned docs before changing native configuration.
