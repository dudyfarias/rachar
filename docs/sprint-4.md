# Sprint 4 - Beta Colaborativo E Persistencia Social

## Objetivo Do Sprint

Preparar o app para beta fechado com persistencia social, convites e base para gateway Pix real.

## Funcionalidades Implementadas

- Persistir historico social no Supabase (amigos, restaurantes, grupos, contas).
- Salvar grupos recorrentes por usuario com membros.
- Criar links/convites para participantes via share token.
- Reabrir rachas antigos como templates (carregar conta do banco).
- Sincronizar dados sociais entre dispositivos via Supabase.
- Perfil Pix persistido no banco por usuario.
- Consentimento de analytics com registro de data.
- Tela de historico de contas com acoes de reabrir e compartilhar.
- Tela de visualizacao publica de conta compartilhada.

## Decisoes Tecnicas

- Pix continua atras de `PixGatewayProvider`.
- Analytics nao persiste no AsyncStorage (apenas em memoria).
- Compartilhamento funciona sem conta — RLS permite leitura via share token para `anon`.
- Sync bidirecional: local-first (AsyncStorage) com write-through para Supabase.
- `loadFromSupabase` dispara no login e sobrescreve dados locais com dados do servidor.
- `recordFinishedBill` atualiza estado local imediatamente e faz sync em background.
- Novas tabelas possuem RLS e documentacao atualizada.

## Bibliotecas Utilizadas

- Nenhuma nova dependencia adicionada.
- `expo-clipboard` ja existia no projeto.

## Schema Do Banco (Sprint 4)

Migration: `supabase/migrations/202605260001_sprint_4_social_and_invites.sql`

Novas tabelas:
- `pix_profiles` — perfil Pix por usuario (unico por user_id).
- `recurring_groups` — grupos recorrentes do usuario.
- `recurring_group_members` — membros de cada grupo.
- `recent_friends` — amigos recentes com stats (unico por owner_id + name).
- `restaurant_history` — historico de restaurantes (unico por owner_id + name).
- `analytics_consents` — consentimento de analytics por usuario.

Alteracoes:
- `bills.share_token` — token unico para links publicos de compartilhamento.

Todas com RLS habilitado e policies owner-based.

## Repositorios Supabase

- `billRepository.ts` — createBill, listBills, getBillById, generateShareToken, getBillByShareToken.
- `socialRepository.ts` — upsert/list para friends, restaurants, groups, pix profile, analytics consent.

## Telas Novas

- `BillHistoryScreen` — lista de rachas anteriores com botoes de reabrir e compartilhar.
- `SharedBillScreen` — visualizacao publica de racha compartilhado via token.

## Problemas Encontrados

- Race condition no authStore corrigida (listener antes de getSession).
- Campo 80 invalido no payload Pix removido.
- Bucket de recibos trocado de publico para URL assinada.
- Analytics excluido da persistencia no AsyncStorage.

## Melhorias Futuras

- Split payment real via gateway Pix.
- Plano premium com limites de historico.
- Push notifications.
- Webhooks Pix.
- Supabase Realtime para edicao colaborativa.
- Deep linking para abrir shared bills via URL.

## Checklist De Progresso

- [x] Modelar historico social no banco.
- [x] Criar repositorios Supabase (bill + social).
- [x] Sync bidirecional no socialStore.
- [x] Reabrir rachas antigos como template no billStore.
- [x] Criar tela de historico (BillHistoryScreen).
- [x] Criar links de compartilhamento (share token).
- [x] Criar tela de visualizacao publica (SharedBillScreen).
- [x] Persistir perfil Pix no Supabase.
- [x] Consentimento de analytics no banco.
- [x] Registrar novas rotas no RootNavigator.
- [x] Disparar sync no login (App.tsx).
- [x] Atualizar docs e changelog.
- [ ] Definir parceiro Pix real.
- [ ] Criar politica de privacidade.
- [ ] Implementar deep linking para shared bills.

## Proximos Passos

Preparar o app para producao: performance, seguranca, CI/CD, EAS Build, assets de loja.
