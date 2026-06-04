-- Optimizes shared bill RLS policies for Supabase performance advisors.

drop policy if exists "Users can manage own bills" on public.bills;
drop policy if exists "Public read via share token" on public.bills;
drop policy if exists "Users can view own or shared bills" on public.bills;
drop policy if exists "Anon can read bills via share token" on public.bills;
drop policy if exists "Users can create own bills" on public.bills;
drop policy if exists "Users can update own bills" on public.bills;
drop policy if exists "Users can delete own bills" on public.bills;

create policy "Users can view own or shared bills"
  on public.bills for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or (
      share_token is not null
      and share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
    )
  );

create policy "Anon can read bills via share token"
  on public.bills for select
  to anon
  using (
    share_token is not null
    and share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
  );

create policy "Users can create own bills"
  on public.bills for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Users can update own bills"
  on public.bills for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Users can delete own bills"
  on public.bills for delete
  to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Users can manage people from own bills" on public.bill_people;
drop policy if exists "Public read people via share token" on public.bill_people;
drop policy if exists "Users can view people from own or shared bills" on public.bill_people;
drop policy if exists "Anon can read people via share token" on public.bill_people;
drop policy if exists "Users can create people on own bills" on public.bill_people;
drop policy if exists "Users can update people from own bills" on public.bill_people;
drop policy if exists "Users can delete people from own bills" on public.bill_people;

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
            and b.share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
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
        and b.share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
    )
  );

create policy "Users can create people on own bills"
  on public.bill_people for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bills b
      where b.id = bill_people.bill_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Users can update people from own bills"
  on public.bill_people for update
  to authenticated
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_people.bill_id
        and b.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bills b
      where b.id = bill_people.bill_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete people from own bills"
  on public.bill_people for delete
  to authenticated
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_people.bill_id
        and b.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Users can manage items from own bills" on public.bill_items;
drop policy if exists "Public read items via share token" on public.bill_items;
drop policy if exists "Users can view items from own or shared bills" on public.bill_items;
drop policy if exists "Anon can read items via share token" on public.bill_items;
drop policy if exists "Users can create items on own bills" on public.bill_items;
drop policy if exists "Users can update items from own bills" on public.bill_items;
drop policy if exists "Users can delete items from own bills" on public.bill_items;

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
            and b.share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
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
        and b.share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
    )
  );

create policy "Users can create items on own bills"
  on public.bill_items for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bills b
      where b.id = bill_items.bill_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Users can update items from own bills"
  on public.bill_items for update
  to authenticated
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_items.bill_id
        and b.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bills b
      where b.id = bill_items.bill_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete items from own bills"
  on public.bill_items for delete
  to authenticated
  using (
    exists (
      select 1
      from public.bills b
      where b.id = bill_items.bill_id
        and b.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Users can manage item splits from own bills" on public.item_splits;
drop policy if exists "Public read splits via share token" on public.item_splits;
drop policy if exists "Users can view splits from own or shared bills" on public.item_splits;
drop policy if exists "Anon can read splits via share token" on public.item_splits;
drop policy if exists "Users can create splits on own bills" on public.item_splits;
drop policy if exists "Users can update splits from own bills" on public.item_splits;
drop policy if exists "Users can delete splits from own bills" on public.item_splits;

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
            and b.share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
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
        and b.share_token = (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-token')
    )
  );

create policy "Users can create splits on own bills"
  on public.item_splits for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bill_items bi
      join public.bills b on b.id = bi.bill_id
      where bi.id = item_splits.bill_item_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Users can update splits from own bills"
  on public.item_splits for update
  to authenticated
  using (
    exists (
      select 1
      from public.bill_items bi
      join public.bills b on b.id = bi.bill_id
      where bi.id = item_splits.bill_item_id
        and b.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bill_items bi
      join public.bills b on b.id = bi.bill_id
      where bi.id = item_splits.bill_item_id
        and b.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete splits from own bills"
  on public.item_splits for delete
  to authenticated
  using (
    exists (
      select 1
      from public.bill_items bi
      join public.bills b on b.id = bi.bill_id
      where bi.id = item_splits.bill_item_id
        and b.owner_id = (select auth.uid())
    )
  );
