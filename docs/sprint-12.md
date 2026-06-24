# Sprint 12 - Login na entrada, guia opcional

## Objetivo

Tornar o login a porta de entrada do app e transformar o fluxo guiado em um tour opcional acessivel pela Home.

## Entregas

- App abre direto na tela de Login quando nao ha sessao ativa, sem etapa de onboarding obrigatoria.
- Fluxo guiado vira tour opcional: a Home ganha o atalho `Ver o passo a passo` que abre o guia.
- Onboarding encerra com `Comecar a usar` (volta para a Home) e ganhou botao de fechar; deixou de pedir login no fim.
- `Escanear sem conta` sai do onboarding e passa a viver como link secundario na tela de Login.
- Estado de preferencias simplificado: removido o campo morto `authEntryRoute`.
- Contrato de UI atualizado: `onboarding-finish-button`, `home-guided-tour-button` e `login-guest-scan-button` substituem `onboarding-login-button`, `onboarding-register-button` e `onboarding-scan-start-button`.

## Validacao

- `npm test`
- `npm run typecheck`
- `npm run ui:check`
- `npm run docs:check`

## Proximos passos

- Automatizar screenshots mobile para Home, Captura, Revisao, Pessoas, Itens e Resultado.
- Evoluir revisao da nota para edicao inline.
- Separar carregamento inicial do PWA por rotas quando o stack permitir.
