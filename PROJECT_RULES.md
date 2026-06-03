# PROJECT_RULES.md

Este arquivo define as regras do Rachaê para desenvolvedores humanos e agentes IA como Codex, Claude, Cursor, Windsurf e Devin.

## Principios

- Produto real, nao prototipo descartavel.
- Codigo legivel antes de inteligente.
- Baixo acoplamento entre UI, estado, servicos e banco.
- Tipagem forte para contratos de dominio.
- Documentacao atualizada junto com a feature.

## Padroes De Codigo

- TypeScript strict.
- Componentes pequenos e nomeados.
- Evitar logica financeira dentro de telas.
- Valores monetarios sempre em centavos.
- Funcoes de dominio devem ser puras sempre que possivel.
- Evitar dependencias novas sem justificativa no PR.

## Nomenclatura

- Componentes: `PascalCase`.
- Hooks/stores: `useNome`.
- Funcoes utilitarias: `camelCase`.
- Arquivos de tela: `NomeScreen.tsx`.
- Migrations: timestamp + descricao em snake_case.

## Arquitetura

- `src/components/ui`: componentes reutilizaveis e sem regra de negocio.
- `src/features`: telas e fluxos por dominio.
- `src/services`: regras de negocio puras.
- `src/stores`: estado global Zustand.
- `src/lib`: infraestrutura e helpers.
- `src/types`: contratos compartilhados.
- `supabase/migrations`: schema versionado.

## Componentes

- Reusar `Button`, `Input`, `Card`, `Header`, `Loading`, `Modal`, `BottomSheet`.
- Componentes de UI devem aceitar props simples e previsiveis.
- Evitar estilos inline, exceto quando bibliotecas nativas exigirem.
- Preferir NativeWind e tokens do projeto.

## Telas

- Cada tela deve estar em uma feature.
- Telas devem orquestrar estados e componentes, nao conter regras financeiras complexas.
- Fluxos com formulario devem validar antes de navegar.
- Estados vazios, loading e erro devem existir quando aplicavel.

## Responsividade

- Priorizar layouts fluidos com `flex`, `gap`, `ScrollView` e areas seguras.
- Evitar texto cortado.
- Botoes principais devem ficar acessiveis no rodape quando o fluxo exigir decisao.

## Estado Global

- Zustand para estado global pequeno e explicito.
- Persistir apenas preferencias e estados que precisam sobreviver ao app fechado.
- Nao persistir segredos.
- Supabase e responsavel pela persistencia de sessao auth.

## APIs E Supabase

- Nunca expor `service_role`.
- Usar apenas `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no app.
- Habilitar RLS em toda tabela publica.
- Politicas devem seguir o dono do recurso.
- Migrations precisam atualizar `docs/database.md`.

## IA E OCR

- OCR deve ficar isolado em servicos ou Edge Functions.
- IA deve receber dados minimizados e sem chaves no cliente.
- Prompts, schemas e custos devem ser documentados antes de producao.
- Qualquer integracao de IA/OCR deve atualizar `docs/architecture.md`, `docs/api.md` e `docs/roadmap.md`.

## Documentacao

Toda feature nova deve atualizar:

- README quando alterar onboarding, instalacao ou arquitetura.
- Sprint correspondente em `docs/sprint-*.md`.
- `CHANGELOG.md`.
- Docs especificos: arquitetura, banco, API ou design system.

Rodar:

```bash
npm test
npm run typecheck
npm run ui:check
npm run docs:check
```

## Fechamento De Sprint

Ao final de todo sprint:

- Rodar validacoes automatizadas antes de publicar.
- Rodar `npm run ui:check` quando o sprint alterar telas, copy ou componentes de UI.
- Atualizar documentacao e `CHANGELOG.md`.
- Criar commit semantico com o estado final do sprint.
- Enviar a branch atual para o repositorio remoto.
- Publicar a versao validada no Vercel quando houver mudanca web/PWA ou fechamento de sprint.

## Commits

Usar commits semanticos:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `chore:`

## Pull Requests

Todo PR deve explicar:

- O que mudou.
- Como testar.
- Quais docs foram atualizadas.
- Riscos e proximos passos.
