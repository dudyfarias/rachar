-- Sprint 4: Social persistence, invite links, Pix profiles, analytics consent

-- Share token on bills for public invite links
alter table public.bills
  add column if not exists share_token text unique default null;

create index if not exists bills_share_token_idx
  on public.bills (share_token) where share_token is not null;

-- Anyone with the token can read the bill (no auth required)
create policy "Public read via share token"
  on public.bills for select
  to anon, authenticated
  using (share_token is not null and share_token = current_setting('request.headers', true)::json ->> 'x-share-token');

-- Public read for bill_people/bill_items/item_splits when parent bill has share_token
create policy "Public read people via share token"
  on public.bill_people for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.bills
      where bills.id = bill_people.bill_id
        and bills.share_token is not null
        and bills.share_token = current_setting('request.headers', true)::json ->> 'x-share-token'
    )
  );

create policy "Public read items via share token"
  on public.bill_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.bills
      where bills.id = bill_items.bill_id
        and bills.share_token is not null
        and bills.share_token = current_setting('request.headers', true)::json ->> 'x-share-token'
    )
  );

create policy "Public read splits via share token"
  on public.item_splits for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.bill_items
      join public.bills on bills.id = bill_items.bill_id
      where bill_items.id = item_splits.bill_item_id
        and bills.share_token is not null
        and bills.share_token = current_setting('request.headers', true)::json ->> 'x-share-token'
    )
  );

-- Pix profiles per user
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

create index if not exists pix_profiles_user_id_idx on public.pix_profiles (user_id);

alter table public.pix_profiles enable row level security;

create policy "Users can manage own pix profile"
  on public.pix_profiles for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists set_pix_profiles_updated_at on public.pix_profiles;
create trigger set_pix_profiles_updated_at
  before update on public.pix_profiles
  for each row execute function public.set_updated_at();

-- Recurring groups
create table if not exists public.recurring_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  bill_count integer not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists recurring_groups_owner_id_idx
  on public.recurring_groups (owner_id, last_used_at desc);

alter table public.recurring_groups enable row level security;

create policy "Users can manage own recurring groups"
  on public.recurring_groups for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Recurring group members
create table if not exists public.recurring_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.recurring_groups (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists recurring_group_members_group_id_idx
  on public.recurring_group_members (group_id);

alter table public.recurring_group_members enable row level security;

create policy "Users can manage members of own groups"
  on public.recurring_group_members for all
  to authenticated
  using (
    exists (
      select 1 from public.recurring_groups
      where recurring_groups.id = recurring_group_members.group_id
        and recurring_groups.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.recurring_groups
      where recurring_groups.id = recurring_group_members.group_id
        and recurring_groups.owner_id = (select auth.uid())
    )
  );

-- Recent friends
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

create index if not exists recent_friends_owner_id_idx
  on public.recent_friends (owner_id, last_seen_at desc);

alter table public.recent_friends enable row level security;

create policy "Users can manage own recent friends"
  on public.recent_friends for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Restaurant history
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

create index if not exists restaurant_history_owner_id_idx
  on public.restaurant_history (owner_id, last_visited_at desc);

alter table public.restaurant_history enable row level security;

create policy "Users can manage own restaurant history"
  on public.restaurant_history for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Analytics consent
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

alter table public.analytics_consents enable row level security;

create policy "Users can manage own analytics consent"
  on public.analytics_consents for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists set_analytics_consents_updated_at on public.analytics_consents;
create trigger set_analytics_consents_updated_at
  before update on public.analytics_consents
  for each row execute function public.set_updated_at();
