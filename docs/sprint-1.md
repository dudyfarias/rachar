# Sprint 1 - Fundacao E Divisao Manual

## Objetivo

Construir a fundacao mobile do Rachaê e entregar o fluxo manual de divisao de contas.

## Funcionalidades Implementadas

- Estrutura Expo + TypeScript.
- NativeWind configurado.
- React Navigation com fluxo publico e privado.
- Supabase Auth preparado.
- Modo demo para navegar localmente sem chaves.
- Zustand para auth, preferencias e rascunho de conta.
- Design system inicial.
- Telas: Onboarding, Login, Cadastro, Home, Nova Conta, Adicionar Pessoas, Adicionar Itens e Resultado Final.
- Engine financeira `calculateSplits.ts`.
- Migration Supabase inicial.
- Documentacao e templates GitHub.

## Arquitetura Criada

- UI reutilizavel em `src/components/ui`.
- Features separadas em `src/features/auth` e `src/features/bills`.
- Regra financeira isolada em `src/services/billing`.
- Estado global isolado em `src/stores`.
- Tipos compartilhados em `src/types`.

## Decisoes Tecnicas

- Valores monetarios sempre em centavos.
- Taxa e desconto distribuidos proporcionalmente ao subtotal de cada pessoa.
- Arredondamento por maior resto para manter soma exata.
- RLS habilitado em todas as tabelas publicas.
- Trigger de criacao de perfil em schema privado.

## Bibliotecas Utilizadas

- Expo
- React Native
- TypeScript
- NativeWind
- React Navigation
- Supabase JS
- Zustand
- Lucide React Native

## Problemas Encontrados

- Supabase CLI nao esta instalado no ambiente local; a migration foi criada manualmente.
- Projeto ainda nao tem chaves reais do Supabase, portanto o app inclui modo demo.
- TypeScript 6 avisou sobre `baseUrl`; a configuracao foi removida.

## Melhorias Futuras

- Persistir contas no Supabase.
- Adicionar testes automatizados para `calculateSplits.ts`.
- Criar historico de rachas.
- Compartilhar resultado por WhatsApp.
- Gerar cobrancas Pix.

## Pendencias

- Configurar projeto Supabase real.
- Aplicar migration no ambiente remoto.
- Conectar salvar/editar contas ao banco.
- Capturar screenshots reais apos rodar o app.

## Checklist De Progresso

- [x] Criar app Expo TypeScript.
- [x] Configurar NativeWind.
- [x] Criar navegacao.
- [x] Criar auth Supabase.
- [x] Criar design system.
- [x] Criar telas principais.
- [x] Criar engine financeira.
- [x] Criar migration Supabase.
- [x] Criar README e docs.
- [x] Criar templates GitHub.
- [ ] Aplicar migration em Supabase remoto.
- [ ] Salvar screenshots em `docs/screenshots/`.

## Proximos Passos

- Sprint 2: persistencia real, historico e edicao de rachas.
- Sprint 3: OCR de nota fiscal e revisao assistida.
- Sprint 4: Pix, compartilhamento e beta fechado.

## Prints/Telas Futuras Preparadas

- `docs/screenshots/onboarding.png`
- `docs/screenshots/home.png`
- `docs/screenshots/new-bill.png`
- `docs/screenshots/result.png`
