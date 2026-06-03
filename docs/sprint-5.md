# Sprint 5 - Estabilizacao Tecnica

## Objetivo Do Sprint

Corrigir os pontos de risco encontrados na retomada do projeto antes de iniciar novas features de v1.0.

## Funcionalidades E Correcoes Implementadas

- Persistencia Supabase de contas agora usa IDs internos de pessoas e itens, evitando colisao quando nomes se repetem.
- Historico carregado do Supabase inclui `people_count` real por conta.
- Tela de racha compartilhado usa ID da pessoa como chave de lista.
- `scripts/generate-assets.js` cria a pasta `assets/` antes de gravar PNGs.
- Assets placeholder versionados: `icon.png`, `adaptive-icon.png`, `splash.png` e `favicon.png`.
- Metadata de loja criada em `assets/store/metadata.json`.
- `app.json` removeu `extra.eas.projectId` e `updates.url` vazios.
- `eas.json` removeu configuracao de submit com credenciais vazias.
- Workflow de producao passou a fazer build de producao sem tentar submit automatico.
- `docs/api.md` foi atualizado para refletir a persistencia real implementada no Sprint 4.
- Versao do app atualizada para `0.4.2`.

## Decisoes Tecnicas

- IDs de dominio sao a fonte de verdade no sync de contas. Nomes continuam sendo dados de exibicao.
- Contagem de participantes e calculada no cliente a partir de `bill_people`, evitando mudanca de schema.
- EAS Project ID, EAS Update URL e credenciais de submit nao foram inventados no repo. Esses valores devem ser gerados por `npx eas init`, `npx eas update:configure` e pela configuracao real das lojas.
- Submit para App Store Connect e Google Play fica manual ate existirem credenciais reais e secrets no CI.

## Arquivos Principais

- `src/lib/supabase/billRepository.ts`
- `src/stores/socialStore.ts`
- `src/features/bills/screens/SharedBillScreen.tsx`
- `scripts/generate-assets.js`
- `app.json`
- `eas.json`
- `.github/workflows/production.yml`
- `assets/store/metadata.json`
- `docs/api.md`

## Checklist De Progresso

- [x] Corrigir sync de pessoas por ID.
- [x] Corrigir sync de itens por ID.
- [x] Corrigir contagem de pessoas no historico remoto.
- [x] Corrigir chave de lista na conta compartilhada.
- [x] Corrigir geracao de assets.
- [x] Versionar assets placeholder.
- [x] Criar metadata de loja.
- [x] Remover placeholders vazios de EAS/update/submit.
- [x] Atualizar API docs, README e changelog.
- [x] Atualizar versao para `0.4.2`.

## Validacao

- `node scripts/check-docs.js`: aprovado.
- `node scripts/generate-assets.js`: aprovado.
- Validacao de JSON em `app.json`, `eas.json`, `package.json`, `package-lock.json` e `assets/store/metadata.json`: aprovada.

`npm test` e `npm run typecheck` continuam obrigatorios antes de publicar, mas dependem de `npm install` em um ambiente com `npm` disponivel.

## Proximos Passos

- Rodar `npm ci`, `npm test`, `npm run typecheck` e `npm run docs:check` em ambiente Node completo.
- Rodar `npx eas init` para gerar o Project ID real.
- Configurar credenciais de submit antes de reativar `eas submit` no CI.
- Seguir para v1.0: gateway Pix real, offline parcial e preparacao de loja.
