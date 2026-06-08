# Sprint 10 - Reset UI/UX

## Objetivo

Reduzir a confusao da jornada principal e preparar o app para testes visuais em PWA mobile.

## Entregas

- Home simplificada com foco em scan, rascunho ativo e atalhos essenciais.
- `Card` com variantes `default`, `soft`, `dark` e `brand`.
- `FlowStepHeader` para orientar etapas de racha e captura.
- Captura da nota sem CTA bloqueado antes de existir imagem.
- Resultado com card principal corrigido e QR Code carregado sob demanda.
- Social/Pix reorganizado em abas de Pix, grupos e atividade.
- Copy de telas de usuario sem termos internos de infraestrutura.

## Validacao

- `npm test`
- `npm run typecheck`
- `npm run ui:check`
- `npm run docs:check`
- `npm run build:web`
- Browser mobile no app publicado ou em dev server para checar Home, Captura, Social/Pix e Resultado.

## Proximos passos

- Automatizar screenshots mobile para Home, Captura, Revisao, Pessoas, Itens e Resultado.
- Evoluir revisao da nota para edicao inline.
- Separar carregamento inicial do PWA por rotas quando o stack permitir.
