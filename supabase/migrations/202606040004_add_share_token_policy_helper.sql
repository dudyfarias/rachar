-- Uses a stable helper so shared bill RLS policies can cache the request token.

create or replace function public.current_share_token()
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token';
$$;

drop policy if exists "Users can view own or shared bills" on public.bills;
drop policy if exists "Anon can read bills via share token" on public.bills;

create policy "Users can view own or shared bills"
  on public.bills for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or (
      share_token is not null
      and share_token = (select public.current_share_token())
    )
  );

create policy "Anon can read bills via share token"
  on public.bills for select
  to anon
  using (
    share_token is not null
    and share_token = (select public.current_share_token())
  );

drop policy if exists "Users can view people from own or shared bills" on public.bill_people;
drop policy if exists "Anon can read people via share token" on public.bill_people;

create policy "Users can view people from own or shared bills"
  on public.bill_people for select
  to authenticated
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_people.bill_id
        and (
          b.owner_id = (select auth.uid())
          or (
            b.share_token is not null
            and b.share_token = (select public.current_share_token())
          )
        )
    )
  );

create policy "Anon can read people via share token"
  on public.bill_people for select
  to anon
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_people.bill_id
        and b.share_token is not null
        and b.share_token = (select public.current_share_token())
    )
  );

drop policy if exists "Users can view items from own or shared bills" on public.bill_items;
drop policy if exists "Anon can read items via share token" on public.bill_items;

create policy "Users can view items from own or shared bills"
  on public.bill_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_items.bill_id
        and (
          b.owner_id = (select auth.uid())
          or (
            b.share_token is not null
            and b.share_token = (select public.current_share_token())
          )
        )
    )
  );

create policy "Anon can read items via share token"
  on public.bill_items for select
  to anon
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_items.bill_id
        and b.share_token is not null
        and b.share_token = (select public.current_share_token())
    )
  );

drop policy if exists "Users can view splits from own or shared bills" on public.item_splits;
drop policy if exists "Anon can read splits via share token" on public.item_splits;

create policy "Users can view splits from own or shared bills"
  on public.item_splits for select
  to authenticated
  using (
    exists (
      select 1
      from public.bill_items bi
      join public.bills b on b.id = bi.bill_id
      where bi.id = item_splits.bill_item_id
        and (
          b.owner_id = (select auth.uid())
          or (
            b.share_token is not null
            and b.share_token = (select public.current_share_token())
          )
        )
    )
  );

create policy "Anon can read splits via share token"
  on public.item_splits for select
  to anon
  using (
    exists (
      select 1
      from public.bill_items bi
      join public.bills b on b.id = bi.bill_id
      where bi.id = item_splits.bill_item_id
        and b.share_token is not null
        and b.share_token = (select public.current_share_token())
    )
  );
