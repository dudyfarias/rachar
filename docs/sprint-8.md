# Sprint 8 - Supabase SQL

## Objetivo

Colocar o Supabase do Rachae em modo SQL versionado, com baseline formal de schema, RLS, triggers e policies no repositorio e no historico de migrations do projeto Supabase.

## Projeto Supabase

- Nome: `rachar`
- Project ref: `ejfqwafueojkszfathdy`
- URL publica: `https://ejfqwafueojkszfathdy.supabase.co`

## Entregas

- Migration `202606040001_supabase_sql_baseline.sql` criada.
- Migration `202606040002_harden_supabase_functions.sql` criada para explicitar `search_path` em helpers de trigger.
- Migration `202606040003_optimize_share_token_policies.sql` criada para separar policies de leitura/escrita e otimizar leitura por `share_token`.
- Migration `202606040004_add_share_token_policy_helper.sql` criada para cachear o token de compartilhamento via helper estavel.
- Baseline idempotente para:
  - `users`
  - `bills`
  - `bill_people`
  - `bill_items`
  - `item_splits`
  - `pix_profiles`
  - `recurring_groups`
  - `recurring_group_members`
  - `recent_friends`
  - `restaurant_history`
  - `analytics_consents`
- RLS habilitado em todas as tabelas publicas do app.
- Policies de dono do recurso recriadas de forma idempotente.
- Policies de leitura publica por `share_token` mantidas para contas compartilhadas.
- Policies de leitura por `share_token` suportam usuarios anonimos e autenticados sem policies permissivas duplicadas por role/action.
- Triggers de `updated_at` e trigger de criacao de perfil via `auth.users` garantidos.
- Advisor de seguranca do Supabase corrigido para `public.set_updated_at`.

## Validacao

Depois de aplicar no Supabase:

```sql
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Tambem verificar:

- Migration aparece em `supabase_migrations`.
- Tabelas publicas estao com RLS habilitado.
- App segue abrindo em modo demo sem variaveis.
- Quando variaveis Supabase forem configuradas no Vercel, Login/Cadastro usam o projeto real.
- Advisor de seguranca nao deve reportar `function_search_path_mutable` para `public.set_updated_at`.
- Advisor de performance nao deve reportar `auth_rls_initplan` ou `multiple_permissive_policies` nas policies de `share_token`.

## Observacoes

- Chaves reais nao devem ser commitadas.
- `EXPO_PUBLIC_SUPABASE_URL` pode ser publico.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` tambem e chave publica do cliente, mas deve ser configurada via ambiente do Vercel em vez de entrar no repo.
- A protecao contra senhas vazadas do Supabase Auth deve ser ativada no dashboard do Supabase.
