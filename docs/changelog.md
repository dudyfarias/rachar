# Changelog Da Documentacao

## 2026-06-08

### Added

- Sprint 10 documentado com reset UI/UX da jornada scanner-first.
- `FlowStepHeader` adicionado para orientar as etapas principais do racha.

### Changed

- Home simplificada para reduzir ruido visual e priorizar scan, rascunho e atalhos essenciais.
- Social/Pix reorganizado em abas de Pix, grupos e atividade.
- README atualizado para `v0.4.9`.

## 2026-06-04

### Added

- Sprint 9 documentado com fluxo scanner first.
- Onboarding em etapas para guiar captura, conferencia, divisao e envio.
- Sprint 8 documentado com baseline SQL do Supabase.
- Migration `202606040001_supabase_sql_baseline.sql` adicionada para registrar schema, triggers, RLS e policies.
- Migration `202606040002_harden_supabase_functions.sql` adicionada para corrigir advisor de seguranca em helper de trigger.
- Migration `202606040003_optimize_share_token_policies.sql` adicionada para corrigir advisors de performance nas policies de `share_token`.
- Migration `202606040004_add_share_token_policy_helper.sql` adicionada para cachear `x-share-token` nas policies de leitura compartilhada.

### Changed

- Home pos-login atualizada para abrir como tela focada em scan da nota.
- Features do fluxo passam a aparecer abaixo do painel principal de scan.
- README atualizado para `v0.4.8`.
- README atualizado para `v0.4.7`.
- Guia de QA frontend atualizado para fluxo scanner first.
- Contrato de UI atualizado para os testIDs do onboarding em etapas.

## 2026-06-02

### Added

- Sprint 7 documentado com PWA, Vercel, manifest, service worker e fluxo de deploy.
- Guia `docs/pwa-vercel.md` criado para publicacao web e configuracao de variaveis no Vercel.
- Sprint 6 documentado com contrato de UI, checklist de QA frontend e testIDs criticos.
- Guia `docs/qa-frontend.md` criado para orientar testes manuais e automacao futura.
- Sprint 5 documentado com estabilizacao tecnica de persistencia, assets e CI.
- Metadata de loja versionada em `assets/store/metadata.json`.

### Changed

- README atualizado para `v0.4.4` e com comandos de build/deploy PWA.
- README atualizado para `v0.4.3` e para incluir `npm run ui:check` no ritual de validacao.
- `PROJECT_RULES.md` e `AGENTS.md` atualizados para exigir o contrato de UI em fechamento de sprint.
- `docs/api.md` atualizado para refletir os repositorios Supabase implementados.
- README atualizado para `v0.4.2` e para o fluxo real de EAS Build sem submit automatico.

## 2026-05-26

### Added

- Sprint 3 documentado com Social, WhatsApp, Pix, historico e analytics.
- Contratos de Pix, resumo WhatsApp e analytics adicionados em `docs/api.md`.
- Fluxo Social e Pix adicionado em `docs/architecture.md`.

### Changed

- Roadmap atualizado para mover compartilhamento e Pix local para o MVP.
- Sprint 4 replanejado para beta colaborativo, persistencia social e gateway Pix real.

## 2026-05-22

### Added

- Criada documentacao de Sprint 1 a Sprint 4.
- Criados documentos de arquitetura, banco, API, design system e roadmap.
- Criada pasta `docs/screenshots`.

### Changed

- Documentacao inicial alinhada ao fluxo manual do Sprint 1.
- Sprint 2 atualizado para OCR + IA com contratos de endpoint e JSON estruturado.

### Fixed

- N/A

### Removed

- N/A
