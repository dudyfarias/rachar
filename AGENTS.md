# Rachaê Agent Guide

Leia primeiro:

- `PROJECT_RULES.md`
- `README.md`
- `docs/architecture.md`
- `docs/database.md`
- sprint correspondente em `docs/sprint-*.md`

## Regras Rapidas

- Mantenha codigo modular, tipado e documentado.
- Valores monetarios sempre em centavos.
- Toda feature nova atualiza docs e `CHANGELOG.md`.
- Mudancas em telas, copy ou componentes de UI precisam passar em `npm run ui:check`.
- Fechamento de sprint precisa gerar commit, push para GitHub e deploy no Vercel.
- Use commits semanticos.
- Nunca exponha chaves reais.
- Para Expo SDK 56, consulte a documentacao versionada antes de alterar configuracoes nativas.
