# Rachaê

Rachaê e um aplicativo mobile para dividir contas de forma justa, rapida e transparente. O Sprint 1 entrega a fundacao do produto e o fluxo manual de divisao: criar uma conta, adicionar pessoas, adicionar itens, aplicar taxa/desconto e ver o resultado final por pessoa.

## Visao Do Produto

Restaurantes, bares, viagens e compras em grupo ainda geram atrito na hora de dividir valores. O Rachaê resolve esse problema com uma experiencia simples, moderna e preparada para evoluir para OCR de notas fiscais, IA de categorizacao, Pix e historico financeiro.

## Proposta De Valor

- Divisao justa por item, nao apenas por total.
- Taxa e desconto proporcionais ao consumo de cada pessoa.
- Arredondamento em centavos com regra deterministica.
- Base tecnica escalavel para novos devs e agentes de IA.

## Stack

- React Native com Expo
- TypeScript
- NativeWind
- Supabase Auth + Postgres
- Zustand
- React Navigation

## Arquitetura

```text
src/
  app/                 Providers globais
  components/ui/       Design system reutilizavel
  features/            Features por dominio
    auth/screens/      Onboarding, Login, Cadastro
    bills/screens/     Home, Nova Conta, Pessoas, Itens, Resultado
  lib/                 Helpers de moeda, ids e Supabase
  navigation/          RootNavigator e stacks
  services/billing/    Engine financeira calculateSplits
  stores/              Estados globais Zustand
  theme/               Tokens visuais
  types/               Tipos compartilhados
supabase/
  migrations/          Schema versionado do banco
docs/                  Documentacao viva por sprint e por area
```

## Instalacao

```bash
npm install
cp .env.example .env
```

Configure as variaveis no `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
GOOGLE_VISION_API_KEY=
```

Nunca commitar chaves reais.

## Rodar Localmente

```bash
npm start
npm run ios
npm run android
npm run web
```

Validacoes:

```bash
npm run typecheck
npm run docs:check
```

## Banco De Dados

O schema inicial esta em `supabase/migrations/202605220001_create_sprint_1_schema.sql` e cria:

- `users`
- `bills`
- `bill_people`
- `bill_items`
- `item_splits`

As tabelas usam RLS e politicas baseadas no dono da conta. Veja `docs/database.md`.

## Funcionalidades Do Sprint 1

- Onboarding
- Login e cadastro via Supabase
- Modo demo local sem chaves Supabase
- Home
- Criacao manual de conta
- Cadastro de pessoas
- Cadastro de itens com participantes por item
- Resultado final por pessoa
- Engine `calculateSplits.ts`
- Design system inicial
- Documentacao e templates de colaboracao

## Roadmap

- MVP: fluxo manual completo, persistencia Supabase e historico.
- Beta: OCR de nota fiscal, revisao assistida por IA e compartilhamento.
- 1.0: Pix, convites, sincronizacao em tempo real e planos pagos.

Detalhes em `docs/roadmap.md`.

## Convencoes

- Commits semanticos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Componentes reutilizaveis em `src/components/ui`.
- Features isoladas em `src/features/<dominio>`.
- Valores monetarios sempre em centavos.
- Toda nova feature deve atualizar docs, sprint correspondente e changelog.

## GitHub

O projeto esta preparado para colaboracao com:

- `CONTRIBUTING.md`
- `PROJECT_RULES.md`
- Pull Request Template
- Issue Templates
- `CHANGELOG.md`
- `docs/`

Repositorio alvo: `https://github.com/dudyfarias/rachar`
