# Rachae

App mobile para dividir contas de forma justa, rapida e transparente. Combina divisao manual por item com OCR + IA para transformar fotos de comandas em rascunhos conferiveis.

**Versao atual:** v0.4.1 — Sprint 4 completo  
**Repositorio:** https://github.com/dudyfarias/rachar  
**Stack:** React Native · Expo SDK 56 · TypeScript · NativeWind · Supabase · Zustand

---

## Comecar em um novo dispositivo

### Pre-requisitos

| Ferramenta | Versao minima | Instalacao |
|---|---|---|
| Node.js | 20+ (recomendado: 24 via NVM) | https://github.com/nvm-sh/nvm |
| npm | 10+ | vem com Node |
| Expo Go | ultima | App Store / Play Store |
| Xcode | 15+ | Mac App Store (para iOS simulator) |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |

> Nao e necessario instalar `expo-cli` globalmente. O projeto usa `npx expo`.

### 1. Clonar e instalar

```bash
git clone git@github.com:dudyfarias/rachar.git
cd rachar
npm install
```

### 2. Configurar variaveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com suas chaves:

```env
# Supabase — obrigatorio para auth e banco de dados
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Bucket de recibos no Supabase Storage
EXPO_PUBLIC_SUPABASE_RECEIPT_BUCKET=receipts

# OCR e IA — opcional, app funciona em modo demo sem estas
EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT=
EXPO_PUBLIC_RECEIPT_AI_ENDPOINT=
OPENAI_API_KEY=
GOOGLE_VISION_API_KEY=

# Login de teste local (nao cria usuario real no Supabase)
EXPO_PUBLIC_TEST_ADMIN_EMAIL=
EXPO_PUBLIC_TEST_ADMIN_PASSWORD=
```

> **Sem Supabase?** O app inicia em **modo demo** automaticamente — todas as funcionalidades funcionam localmente, sem banco.

### 3. Aplicar o schema do banco

Se voce criou um projeto Supabase novo, execute as migrations na ordem:

```bash
# Via Supabase CLI
supabase db push

# Ou manualmente no SQL Editor do dashboard Supabase:
# 1. supabase/migrations/202605220001_create_sprint_1_schema.sql
# 2. supabase/migrations/202605260001_sprint_4_social_and_invites.sql
```

### 4. Rodar o app

```bash
npm start          # Metro bundler + QR code para Expo Go
npm run ios        # iOS Simulator (requer Xcode no Mac)
npm run android    # Android Emulator (requer Android Studio)
npm run web        # Navegador
```

---

## Comandos de desenvolvimento

```bash
npm test           # Vitest — testes unitarios (engine financeira + OCR parser)
npm run typecheck  # tsc --noEmit
npm run docs:check # Valida cobertura de documentacao
```

Execute os tres antes de abrir um PR ou fechar um sprint.

---

## Arquitetura

Feature-based modular — UI, estado, servicos e banco sao desacoplados por design.

```
src/
  app/                   Providers globais (auth listener, navigation container)
  components/ui/         Design system: Button, Input, Card, Header, Loading, Modal, BottomSheet
  features/
    auth/screens/        Onboarding, Login, Cadastro
    bills/screens/       Home, Nova Conta, Pessoas, Itens, Resultado, Historico
    receipts/screens/    Captura, Processamento, Conferencia Inteligente
    social/screens/      Social Hub, Pix, Conta Compartilhada
  lib/                   Supabase client, formatCurrency, generateId, cache, queue, logger,
                         rateLimiter, security (uploadValidator, inputSanitizer, antiFraud)
  navigation/            RootNavigator + stacks tipados
  services/
    billing/             calculateSplits.ts — engine financeira pura
    receipts/            receiptOcr.ts, receiptParser.ts, receiptMemory.ts, receiptPatterns.ts
    social/              generateWhatsAppSummary.ts, pix.ts (StaticPixGatewayProvider), analytics.ts
  stores/                appStore, authStore, billStore, receiptStore, socialStore (Zustand)
  theme/                 Tokens visuais
  types/                 Contratos TypeScript compartilhados
supabase/
  migrations/            Schema versionado
docs/                    Documentacao por sprint e area
web/                     Politica de Privacidade e Termos de Uso (GitHub Pages)
```

### Engine financeira

`src/services/billing/calculateSplits.ts` — recebe `BillDraft`, retorna `SplitSummary`.

- Cada item e dividido apenas entre seus participantes.
- Taxa e desconto proporcionais ao subtotal de cada pessoa.
- Arredondamento deterministico em centavos.
- **Todos os valores monetarios sao inteiros em centavos.**

### Stores Zustand

| Store | Responsabilidade |
|---|---|
| `appStore` | Onboarding e preferencias |
| `authStore` | Sessao, login/cadastro/logout, modo demo |
| `billStore` | Rascunho da conta manual + loadFromTemplate |
| `receiptStore` | Pipeline captura → OCR → IA → revisao |
| `socialStore` | Pix, historico, amigos, grupos recorrentes, analytics |

### Supabase

- Auth via AsyncStorage + autoRefreshToken + processLock.
- RLS obrigatorio em toda tabela — politicas owner-based (`auth.uid()`).
- App usa apenas `EXPO_PUBLIC_SUPABASE_ANON_KEY` — nunca `service_role`.
- Bills com `share_token` podem ser lidas por usuarios anonimos via header `x-share-token`.
- Imagens de comandas usam signed URLs (nunca publicas).

---

## Banco de dados

Migrations em `supabase/migrations/`, aplicadas em ordem cronologica:

| Migration | Conteudo |
|---|---|
| `202605220001_create_sprint_1_schema.sql` | `users`, `bills`, `bill_people`, `bill_items`, `item_splits` |
| `202605260001_sprint_4_social_and_invites.sql` | `pix_profiles`, `recurring_groups`, `recurring_group_members`, `recent_friends`, `restaurant_history`, `analytics_consents`, campo `bills.share_token` |

Documentacao completa do schema em `docs/database.md`.

---

## Funcionalidades implementadas

### Sprint 1 — Fluxo manual
Onboarding, auth Supabase, modo demo, home, criacao de conta, pessoas, itens por participante, resultado final, engine `calculateSplits.ts`, design system.

### Sprint 2 — OCR + IA
Captura por camera/galeria, crop e compressao, upload para Supabase Storage, pipeline OCR abstrato e trocavel, parser de IA, conferencia inteligente com validacao de total.

### Sprint 3 — Social e Pix
Compartilhamento por WhatsApp, perfil Pix com QR Code e copia e cola, `PixGatewayProvider` abstrato, historico de rachas, amigos recentes, grupos recorrentes, restaurantes, analytics local.

### Sprint 4 — Persistencia e producao
Persistencia social no Supabase, sync bidirecional local-first, historico de contas (`BillHistoryScreen`), tela de conta compartilhada (`SharedBillScreen`), deep link `rachae://bill/:token`, perfil Pix persistido, consentimento de analytics, repositorios Supabase (`billRepository.ts`, `socialRepository.ts`), cache, fila com retry, logger, rate limiter, validacao de uploads, sanitizacao de inputs, antifraude, EAS Build + CI/CD GitHub Actions.

---

## Variaveis de ambiente completas

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_RECEIPT_BUCKET=receipts
EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT=
EXPO_PUBLIC_RECEIPT_AI_ENDPOINT=
OPENAI_API_KEY=
GOOGLE_VISION_API_KEY=
EXPO_PUBLIC_TEST_ADMIN_EMAIL=
EXPO_PUBLIC_TEST_ADMIN_PASSWORD=
# EXPO_TOKEN=   # Necessario apenas para EAS Build no CI/CD
```

---

## Build e distribuicao (EAS)

O projeto usa [EAS Build](https://docs.expo.dev/build/introduction/) com tres profiles em `eas.json`:

| Profile | Uso |
|---|---|
| `development` | Build local com dev client |
| `staging` | Build automatico pelo CI em cada push para `main` |
| `production` | Build manual para App Store e Play Store |

Para usar EAS Build e necessario:
1. Criar conta em https://expo.dev
2. Rodar `npx eas init` para gerar o `projectId` e preencher `extra.eas.projectId` em `app.json`
3. Configurar `EXPO_TOKEN` como secret no GitHub para o CI funcionar

---

## Paginas legais (GitHub Pages)

`web/privacidade.html` e `web/termos.html` sao estaticas e prontas para publicar.

**Para ativar:** repositorio → Settings → Pages → Source: main / /web

URLs apos ativar:
- `https://dudyfarias.github.io/rachar/privacidade`
- `https://dudyfarias.github.io/rachar/termos`

---

## Convencoes

- Commits semanticos: `feat:` `fix:` `refactor:` `docs:` `chore:`
- Valores monetarios **sempre em centavos** — nunca floats.
- Logica financeira fica em `src/services/billing/`, nao em telas.
- Componentes reutilizaveis em `src/components/ui` antes de criar novos.
- Toda feature nova atualiza `docs/`, o sprint correspondente e `CHANGELOG.md`.
- Novas tabelas Supabase precisam de RLS e devem atualizar `docs/database.md`.

Regras completas em `PROJECT_RULES.md`.

---

## Roadmap

| Fase | Status |
|---|---|
| MVP — fluxo manual, OCR demo, Pix local, historico | ✅ Completo |
| Beta — persistencia social, convites, share link | ✅ Completo |
| v1.0 — gateway Pix real, offline parcial, loja | Em andamento |

Detalhes em `docs/roadmap.md`.
