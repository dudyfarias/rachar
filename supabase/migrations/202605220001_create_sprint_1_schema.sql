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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists bills_owner_id_idx on public.bills (owner_id);
create index if not exists bills_owner_status_created_idx on public.bills (owner_id, status, created_at desc);
create index if not exists bill_people_bill_id_idx on public.bill_people (bill_id);
create index if not exists bill_items_bill_id_idx on public.bill_items (bill_id);
create index if not exists item_splits_bill_item_id_idx on public.item_splits (bill_item_id);
create index if not exists item_splits_bill_person_id_idx on public.item_splits (bill_person_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.users enable row level security;
alter table public.bills enable row level security;
alter table public.bill_people enable row level security;
alter table public.bill_items enable row level security;
alter table public.item_splits enable row level security;

create policy "Users can view own profile"
on public.users for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.users for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can create own profile"
on public.users for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can manage own bills"
on public.bills for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

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
