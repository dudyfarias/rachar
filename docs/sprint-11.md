# Sprint 11 - Login First

## Objetivo

Inverter a hierarquia da jornada de entrada: autenticacao passa a ser a acao principal e o scanner vira acao secundaria, mantendo o fluxo convidado disponivel sem destaque.

## Entregas

- Onboarding com `Entrar` e `Criar conta` como CTAs principais da ultima etapa.
- `Escanear sem conta` rebaixado para link secundario no rodape do onboarding.
- Copy do onboarding atualizada para refletir a conta como porta de entrada.
- App abre direto na tela de Login quando o onboarding ja foi visto e nao ha sessao ativa.
- Home com painel `Entre na sua conta` acima do painel de scan para convidados.
- Header da Home renomeado para `Inicio`.
- Fluxo convidado do onboarding passa a montar a pilha `Home > Captura` para preservar navegacao de volta.
- Contrato de UI atualizado: `onboarding-login-button` e `onboarding-register-button` substituem os links de auth.

## Validacao

- `npm test`
- `npm run typecheck`
- `npm run ui:check`
- `npm run docs:check`

## Proximos passos

- Automatizar screenshots mobile para Home, Captura, Revisao, Pessoas, Itens e Resultado.
- Evoluir revisao da nota para edicao inline.
- Separar carregamento inicial do PWA por rotas quando o stack permitir.
