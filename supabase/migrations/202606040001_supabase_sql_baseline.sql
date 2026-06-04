-- Supabase SQL baseline for the Rachae production project.
-- Idempotent on top of the existing Sprint 1 and Sprint 4 migrations.

create extension if not exists "pgcrypto";

create schema if not exists private;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  place text,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  service_fee_cents integer not null default 0 check (service_fee_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  status text not null default 'draft' check (status in ('draft', 'closed')),
  share_token text unique default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bills
  add column if not exists share_token text unique default null;

create table if not exists public.bill_people (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills (id) on delete cascade,
  name text not null,
  contact_hint text,
  created_at timestamptz not null default now()
);

create table if not exists public.bill_items (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills (id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.item_splits (
  id uuid primary key default gen_random_uuid(),
  bill_item_id uuid not null references public.bill_items (id) on delete cascade,
  bill_person_id uuid not null references public.bill_people (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  created_at timestamptz not null default now(),
  unique (bill_item_id, bill_person_id)
);

create table if not exists public.pix_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  key text not null default '',
  key_type text not null default 'email' check (key_type in ('cpf', 'cnpj', 'email', 'phone', 'random')),
  receiver_name text not null default '',
  city text not null default 'Sao Paulo',
  description text not null default 'Racha Rachae',
  txid_prefix text not null default 'RACHAE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.recurring_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  bill_count integer not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.recurring_groups (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recent_friends (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  initials text not null default '',
  background_color text not null default '#00A676',
  total_bills integer not null default 1,
  total_in_cents integer not null default 0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table if not exists public.restaurant_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  total_bills integer not null default 1,
  total_in_cents integer not null default 0,
  average_ticket_in_cents integer not null default 0,
  first_visited_at timestamptz not null default now(),
  last_visited_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table if not exists public.analytics_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  consented boolean not null default false,
  consented_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists bills_owner_id_idx on public.bills (owner_id);
create index if not exists bills_owner_status_created_idx on public.bills (owner_id, status, created_at desc);
create index if not exists bills_share_token_idx on public.bills (share_token) where share_token is not null;
create index if not exists bill_people_bill_id_idx on public.bill_people (bill_id);
create index if not exists bill_items_bill_id_idx on public.bill_items (bill_id);
create index if not exists item_splits_bill_item_id_idx on public.item_splits (bill_item_id);
create index if not exists item_splits_bill_person_id_idx on public.item_splits (bill_person_id);
create index if not exists pix_profiles_user_id_idx on public.pix_profiles (user_id);
create index if not exists recurring_groups_owner_id_idx on public.recurring_groups (owner_id, last_used_at desc);
create index if not exists recurring_group_members_group_id_idx on public.recurring_group_members (group_id);
create index if not exists recent_friends_owner_id_idx on public.recent_friends (owner_id, last_seen_at desc);
create index if not exists restaurant_history_owner_id_idx on public.restaurant_history (owner_id, last_visited_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists set_bills_updated_at on public.bills;
create trigger set_bills_updated_at
  before update on public.bills
  for each row execute function public.set_updated_at();

drop trigger if exists set_pix_profiles_updated_at on public.pix_profiles;
create trigger set_pix_profiles_updated_at
  before update on public.pix_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_analytics_consents_updated_at on public.analytics_consents;
create trigger set_analytics_consents_updated_at
  before update on public.analytics_consents
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.users enable row level security;
alter table public.bills enable row level security;
alter table public.bill_people enable row level security;
alter table public.bill_items enable row level security;
alter table public.item_splits enable row level security;
alter table public.pix_profiles enable row level security;
alter table public.recurring_groups enable row level security;
alter table public.recurring_group_members enable row level security;
alter table public.recent_friends enable row level security;
alter table public.restaurant_history enable row level security;
alter table public.analytics_consents enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can create own profile" on public.users;
create policy "Users can create own profile"
  on public.users for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can manage own bills" on public.bills;
create policy "Users can manage own bills"
  on public.bills for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Public read via share token" on public.bills;
create policy "Public read via share token"
  on public.bills for select
  to anon, authenticated
  using (
    share_token is not null
    and share_token = coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token'
  );

drop policy if exists "Users can manage people from own bills" on public.bill_people;
create policy "Users can manage people from own bills"
  on public.bill_people for all
  to authenticated
  using (
    exists (
      select 1
      from public.bills
      where bills.id = bill_people.bill_id
        and bills.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bills
      where bills.id = bill_people.bill_id
        and bills.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Public read people via share token" on public.bill_people;
create policy "Public read people via share token"
  on public.bill_people for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.bills
      where bills.id = bill_people.bill_id
        and bills.share_token is not null
        and bills.share_token = coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token'
    )
  );

drop policy if exists "Users can manage items from own bills" on public.bill_items;
create policy "Users can manage items from own bills"
  on public.bill_items for all
  to authenticated
  using (
    exists (
      select 1
      from public.bills
      where bills.id = bill_items.bill_id
        and bills.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bills
      where bills.id = bill_items.bill_id
        and bills.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Public read items via share token" on public.bill_items;
create policy "Public read items via share token"
  on public.bill_items for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.bills
      where bills.id = bill_items.bill_id
        and bills.share_token is not null
        and bills.share_token = coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token'
    )
  );

drop policy if exists "Users can manage item splits from own bills" on public.item_splits;
create policy "Users can manage item splits from own bills"
  on public.item_splits for all
  to authenticated
  using (
    exists (
      select 1
      from public.bill_items
      join public.bills on bills.id = bill_items.bill_id
      where bill_items.id = item_splits.bill_item_id
        and bills.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bill_items
      join public.bills on bills.id = bill_items.bill_id
      where bill_items.id = item_splits.bill_item_id
        and bills.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Public read splits via share token" on public.item_splits;
create policy "Public read splits via share token"
  on public.item_splits for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.bill_items
      join public.bills on bills.id = bill_items.bill_id
      where bill_items.id = item_splits.bill_item_id
        and bills.share_token is not null
        and bills.share_token = coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token'
    )
  );

drop policy if exists "Users can manage own pix profile" on public.pix_profiles;
create policy "Users can manage own pix profile"
  on public.pix_profiles for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage own recurring groups" on public.recurring_groups;
create policy "Users can manage own recurring groups"
  on public.recurring_groups for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can manage members of own groups" on public.recurring_group_members;
create policy "Users can manage members of own groups"
  on public.recurring_group_members for all
  to authenticated
  using (
    exists (
      select 1
      from public.recurring_groups
      where recurring_groups.id = recurring_group_members.group_id
        and recurring_groups.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.recurring_groups
      where recurring_groups.id = recurring_group_members.group_id
        and recurring_groups.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Users can manage own recent friends" on public.recent_friends;
create policy "Users can manage own recent friends"
  on public.recent_friends for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can manage own restaurant history" on public.restaurant_history;
create policy "Users can manage own restaurant history"
  on public.restaurant_history for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can manage own analytics consent" on public.analytics_consents;
create policy "Users can manage own analytics consent"
  on public.analytics_consents for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
