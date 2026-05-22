# Contribuindo Com O Rachaê

Obrigado por contribuir. Este projeto deve parecer uma startup real desde o primeiro sprint.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Validacao Local

Antes de abrir PR:

```bash
npm run typecheck
npm run docs:check
```

## Fluxo De Branch

- `feat/nome-da-feature`
- `fix/nome-do-bug`
- `docs/nome-da-doc`
- `refactor/nome-do-refactor`

## Commits

Use commits semanticos:

- `feat: nova tela de resultado`
- `fix: corrige arredondamento de centavos`
- `docs: atualiza sprint 1`
- `chore: adiciona template de issue`

## Pull Request

Todo PR deve:

- Ser pequeno o suficiente para revisao.
- Incluir contexto de produto.
- Atualizar documentacao.
- Atualizar changelog.
- Ter passos de teste claros.

## Regras Importantes

- Nunca commitar `.env` com chaves reais.
- Nao misturar refactor grande com feature.
- Nao alterar migration ja aplicada sem criar nova migration.
- Regras financeiras devem ter cobertura ou validacao manual documentada.
