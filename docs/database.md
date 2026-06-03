# Banco De Dados

## Schema

Migrations:

- `supabase/migrations/202605220001_create_sprint_1_schema.sql`
- `supabase/migrations/202605260001_sprint_4_social_and_invites.sql`

## Tabelas

### users

Perfil publico do usuario autenticado.

Campos principais:

- `id`: referencia `auth.users`.
- `full_name`
- `email`
- `avatar_url`
- `created_at`
- `updated_at`

### bills

Conta criada pelo usuario.

Campos principais:

- `id`
- `owner_id`
- `title`
- `place`
- `subtotal_cents`
- `service_fee_cents`
- `discount_cents`
- `total_cents`
- `status` (`draft` | `closed`)
- `share_token` (nullable, unico — token para link publico)
- `created_at`
- `updated_at`

### bill_people

Pessoas participantes de uma conta.

Campos principais:

- `id`
- `bill_id`
- `name`
- `contact_hint`
- `created_at`

### bill_items

Itens da conta.

Campos principais:

- `id`
- `bill_id`
- `name`
- `price_cents`
- `created_at`

### item_splits

Ligacao entre item e pessoa, com valor em centavos.

Campos principais:

- `id`
- `bill_item_id`
- `bill_person_id`
- `amount_cents`
- `created_at`

### pix_profiles

Perfil Pix do usuario. Um por usuario.

Campos principais:

- `id`
- `user_id` (unique)
- `key`
- `key_type` (`cpf` | `cnpj` | `email` | `phone` | `random`)
- `receiver_name`
- `city`
- `description`
- `txid_prefix`
- `created_at`
- `updated_at`

### recurring_groups

Grupos recorrentes do usuario.

Campos principais:

- `id`
- `owner_id`
- `name`
- `bill_count`
- `last_used_at`
- `created_at`

### recurring_group_members

Membros de um grupo recorrente.

Campos principais:

- `id`
- `group_id`
- `name`
- `created_at`

### recent_friends

Amigos recentes com estatisticas. Unico por (owner_id, name).

Campos principais:

- `id`
- `owner_id`
- `name`
- `initials`
- `background_color`
- `total_bills`
- `total_in_cents`
- `first_seen_at`
- `last_seen_at`

### restaurant_history

Historico de restaurantes. Unico por (owner_id, name).

Campos principais:

- `id`
- `owner_id`
- `name`
- `total_bills`
- `total_in_cents`
- `average_ticket_in_cents`
- `first_visited_at`
- `last_visited_at`

### analytics_consents

Consentimento de analytics por usuario. Um por usuario.

Campos principais:

- `id`
- `user_id` (unique)
- `consented`
- `consented_at`
- `revoked_at`
- `created_at`
- `updated_at`

## Relacionamentos

- `users.id` -> `auth.users.id`
- `bills.owner_id` -> `users.id`
- `bill_people.bill_id` -> `bills.id`
- `bill_items.bill_id` -> `bills.id`
- `item_splits.bill_item_id` -> `bill_items.id`
- `item_splits.bill_person_id` -> `bill_people.id`
- `pix_profiles.user_id` -> `users.id`
- `recurring_groups.owner_id` -> `users.id`
- `recurring_group_members.group_id` -> `recurring_groups.id`
- `recent_friends.owner_id` -> `users.id`
- `restaurant_history.owner_id` -> `users.id`
- `analytics_consents.user_id` -> `users.id`

## Regras De Negocio

- Valores financeiros sao armazenados em centavos.
- `bill_items.price_cents` deve ser maior que zero.
- `item_splits.amount_cents` deve ser maior ou igual a zero.
- Uma pessoa nao pode ser duplicada no mesmo item por causa de `unique (bill_item_id, bill_person_id)`.
- A soma de `item_splits` deve bater com o item, respeitando centavos.
- Taxa e desconto podem ser persistidos no `bill` para auditoria.
- `pix_profiles` e `analytics_consents` sao unicos por usuario.
- `recent_friends` e `restaurant_history` sao unicos por (owner, name).

## RLS

Todas as tabelas publicas possuem RLS habilitado.

Politicas:

- Usuario acessa apenas seu proprio perfil.
- Usuario gerencia apenas bills com `owner_id = auth.uid()`.
- Pessoas, itens e splits sao acessiveis apenas se pertencerem a bill do usuario.
- Bills com `share_token` podem ser lidas por `anon` e `authenticated` via header `x-share-token`.
- Pessoas, itens e splits de bills compartilhadas tambem podem ser lidos via share token.
- Pix profiles, recurring groups, recent friends, restaurant history e analytics consents sao owner-based.

## Indices

Criados:

- `bills_owner_id_idx`
- `bills_owner_status_created_idx`
- `bills_share_token_idx` (parcial, onde share_token nao e null)
- `bill_people_bill_id_idx`
- `bill_items_bill_id_idx`
- `item_splits_bill_item_id_idx`
- `item_splits_bill_person_id_idx`
- `pix_profiles_user_id_idx`
- `recurring_groups_owner_id_idx` (composto com last_used_at desc)
- `recurring_group_members_group_id_idx`
- `recent_friends_owner_id_idx` (composto com last_seen_at desc)
- `restaurant_history_owner_id_idx` (composto com last_visited_at desc)

## Politicas De Seguranca

- Nao expor `service_role`.
- Edge Functions usam segredos de OCR/IA.
- App mobile usa apenas chave anon/publishable.
- RLS obrigatorio para todo novo schema exposto.
- URLs de recibos usam signed URLs com expiracao (nao publicas).

## Escalabilidade Futura

- Supabase Realtime para edicao colaborativa.
- Storage para imagens de notas fiscais.
- Edge Functions para OCR, IA e Pix.
- Read replicas para analytics, se necessario.
- Deep linking para abrir shared bills via URL nativa.
