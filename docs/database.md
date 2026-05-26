# Banco De Dados

## Schema

Migration inicial:

`supabase/migrations/202605220001_create_sprint_1_schema.sql`

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
- `status`
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

## Relacionamentos

- `users.id` -> `auth.users.id`
- `bills.owner_id` -> `users.id`
- `bill_people.bill_id` -> `bills.id`
- `bill_items.bill_id` -> `bills.id`
- `item_splits.bill_item_id` -> `bill_items.id`
- `item_splits.bill_person_id` -> `bill_people.id`

## Regras De Negocio

- Valores financeiros sao armazenados em centavos.
- `bill_items.price_cents` deve ser maior que zero.
- `item_splits.amount_cents` deve ser maior ou igual a zero.
- Uma pessoa nao pode ser duplicada no mesmo item por causa de `unique (bill_item_id, bill_person_id)`.
- A soma de `item_splits` deve bater com o item, respeitando centavos.
- Taxa e desconto podem ser persistidos no `bill` para auditoria.

## RLS

Todas as tabelas publicas possuem RLS habilitado.

Politicas:

- Usuario acessa apenas seu proprio perfil.
- Usuario gerencia apenas bills com `owner_id = auth.uid()`.
- Pessoas, itens e splits sao acessiveis apenas se pertencerem a bill do usuario.

## Indices

Criados:

- `bills_owner_id_idx`
- `bills_owner_status_created_idx`
- `bill_people_bill_id_idx`
- `bill_items_bill_id_idx`
- `item_splits_bill_item_id_idx`
- `item_splits_bill_person_id_idx`

## Indices Futuros

- Busca por `created_at` e `place`.
- Indice para contas recorrentes.
- Indice para compartilhamentos publicos anonimizados.
- Indices para historico social, grupos recorrentes, restaurantes e eventos de analytics.

## Politicas De Seguranca

- Nao expor `service_role`.
- Edge Functions usam segredos de OCR/IA.
- App mobile usa apenas chave anon/publishable.
- RLS obrigatorio para todo novo schema exposto.

## Escalabilidade Futura

- Supabase Realtime para edicao colaborativa.
- Storage para imagens de notas fiscais.
- Edge Functions para OCR, IA e Pix.
- Tabelas futuras para historico social hoje persistido localmente em Zustand.
- Read replicas para analytics, se necessario.
