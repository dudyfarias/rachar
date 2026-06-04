# QA Frontend

## Objetivo

Este documento define a base de QA visual e funcional para a interface do Rachae.

## Scripts

```bash
npm test
npm run typecheck
npm run ui:check
npm run docs:check
```

Para validar bundle web:

```bash
npm exec -- expo export --platform web --output-dir dist-web-check
```

Remova `dist-web-check/` depois da validacao local.

## TestIDs Criticos

### Entrada

- `screen-onboarding`
- `onboarding-active-step`
- `onboarding-next-step-button`
- `onboarding-scan-start-button`
- `onboarding-auth-login-link`
- `onboarding-auth-register-link`
- `screen-login`
- `login-email-input`
- `login-password-input`
- `login-submit-button`
- `login-demo-button`
- `screen-register`

### Racha Manual

- `screen-home`
- `home-scan-panel`
- `home-feature-section`
- `home-receipt-capture-button`
- `home-new-bill-button`
- `screen-new-bill`
- `new-bill-title-input`
- `new-bill-continue-button`
- `screen-add-people`
- `add-people-name-input`
- `add-people-add-button`
- `add-people-continue-button`
- `screen-add-items`
- `add-items-name-input`
- `add-items-price-input`
- `add-items-add-button`
- `add-items-continue-button`
- `screen-result`
- `result-finish-button`

### OCR

- `screen-receipt-capture`
- `receipt-capture-camera-button`
- `receipt-capture-gallery-button`
- `receipt-capture-process-button`
- `screen-receipt-processing`
- `screen-receipt-review`
- `receipt-review-use-button`

### Social E Historico

- `screen-social`
- `social-pix-key-input`
- `social-save-pix-button`
- `social-group-name-input`
- `social-save-group-button`
- `screen-bill-history`
- `bill-history-list`
- `screen-shared-bill`

## Fluxos Para Automatizar Primeiro

1. Onboarding em etapas ate abrir captura da conta.
2. Racha manual completo ate resultado.
3. Finalizar racha e conferir historico.
4. Configurar Pix e criar grupo recorrente.
5. Captura de recibo com imagem de galeria e revisao.

## Regras De Copy

- Nao usar nomes de sprint ou detalhes internos de arquitetura na UI.
- Nao expor RLS, Supabase ou nomes de implementacao em copy para usuario final, exceto em mensagens de ambiente local.
- Mensagens de erro devem orientar a proxima acao.
- Estados vazios devem indicar o que fazer em seguida.
