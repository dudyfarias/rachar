# Sprint 9 - Fluxo Scanner First

## Objetivo

Trocar a entrada baseada em Login/Cadastro por uma jornada guiada em etapas, onde a pessoa entende o procedimento e comeca escaneando a conta antes de criar acesso.

## Entregas

- Onboarding convertido em stepper de 4 etapas:
  - escanear a conta;
  - conferir a leitura;
  - montar o racha;
  - enviar e cobrar.
- CTA principal do onboarding passa a abrir `ReceiptCapture`.
- Login e cadastro viram links secundarios para quem quer salvar historico.
- Navigator permite fluxo convidado com Home, OCR, pessoas, itens e resultado sem sessao obrigatoria.
- Home passa a priorizar `Escanear conta`; criacao manual fica como alternativa.
- Home pos-login abre com painel principal `Escanear nota` e features do fluxo logo abaixo.
- Login e modo demo redirecionam para Home depois de criar sessao.
- Contrato de UI atualizado para os novos `testID`s do stepper.

## Decisoes De UX

- A primeira tarefa real do usuario e capturar a conta.
- Cadastro nao pode bloquear a compreensao do produto.
- O fluxo convidado precisa funcionar sem Supabase configurado.
- Conta/login aparecem como beneficio para salvar historico, grupos e Pix.

## Validacao

Rodar antes de publicar:

```bash
npm test
npm run typecheck
npm run ui:check
npm run docs:check
npm run build:web
```

Checklist manual:

- Abrir onboarding e avancar pelas 4 etapas.
- Confirmar que `Escanear conta` abre a captura.
- Confirmar que `Entrar` e `criar conta` continuam acessiveis como links secundarios.
- Abrir Home sem sessao e confirmar scanner como acao principal.
- Entrar ou usar modo demo e confirmar que a primeira tela pos-login mostra `Escanear nota`.
- Entrar em modo demo e confirmar retorno para Home.
