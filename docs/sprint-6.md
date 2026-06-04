# Sprint 6 - Frontend QA E UI Polish

## Objetivo Do Sprint

Preparar a interface para testes automatizados e para uma primeira rodada consistente de QA visual.

## Implementado

- Remocao de linguagem interna de sprint nas telas do app.
- Copy de onboarding, login e cadastro ajustada para comunicar valor de produto em vez de detalhes internos.
- `testID`s adicionados aos fluxos criticos:
  - onboarding;
  - login e cadastro;
  - home;
  - criacao manual de racha;
  - pessoas;
  - itens;
  - resultado;
  - captura, processamento e revisao de recibos;
  - Social e Pix;
  - historico;
  - conta compartilhada.
- Componentes `Button`, `Input` e `Header` reforcados para acessibilidade/testabilidade.
- Script `npm run ui:check` criado para proteger o contrato minimo de UI.
- CI atualizado para rodar `npm run ui:check`.

## Contrato De Testabilidade

O script `scripts/check-ui-contract.js` valida:

- ausencia de copy interna como `Sprint 1`, `Sprint 2` etc. nas telas;
- ausencia de mojibake em componentes e features;
- existencia dos `testID`s minimos para os fluxos criticos.

## Checklist Manual De QA

Antes de publicar uma build de teste:

- Abrir onboarding, avancar pelas etapas e confirmar CTA `Escanear conta`.
- Entrar em modo demo a partir do login e confirmar retorno para Home.
- Criar conta manual com titulo, local, taxa e desconto.
- Adicionar pelo menos duas pessoas.
- Adicionar item dividido entre todos.
- Ver resultado e finalizar racha.
- Reabrir historico e confirmar que o racha aparece.
- Abrir Social e Pix, salvar chave Pix fake e criar grupo recorrente.
- Abrir captura de recibo e validar estados de permissao/captura/galeria.

## Validacao Automatizada Esperada

```bash
npm test
npm run typecheck
npm run ui:check
npm run docs:check
npm exec -- expo export --platform web --output-dir dist-web-check
```

## Proximos Passos

- Escolher ferramenta E2E principal para mobile, preferencialmente Maestro.
- Criar seeds de estado demo para fluxos repetiveis.
- Adicionar snapshots visuais ou screenshots por viewport no alvo web.
- Revisar responsividade e acessibilidade em aparelho real.
