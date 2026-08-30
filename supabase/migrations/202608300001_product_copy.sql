-- Batch product collection runs and items.
-- Every exposed table is protected by RLS and only signed-in owners can access rows.

create table if not exists public.product_copy_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_platform text not null default 'alibaba' check (source_platform = 'alibaba'),
  source_store_url text not null,
  status text not null default 'created' check (status in ('created', 'scanning', 'queued', 'processing', 'completed', 'failed')),
  total_count integer not null default 0 check (total_count >= 0),
  queued_count integer not null default 0 check (queued_count >= 0),
  success_count integer not null default 0 check (success_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_copy_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.product_copy_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_product_id text not null,
  source_url text not null,
  source_title text,
  source_image_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'fetched', 'needs_review', 'draft_ready', 'published', 'failed')),
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (run_id, source_product_id)
);

create index if not exists product_copy_runs_user_created_idx on public.product_copy_runs(user_id, created_at desc);
create index if not exists product_copy_items_run_status_idx on public.product_copy_items(run_id, status);
create index if not exists product_copy_items_user_idx on public.product_copy_items(user_id);

alter table public.product_copy_runs enable row level security;
alter table public.product_copy_items enable row level security;

revoke all on table public.product_copy_runs from anon, authenticated;
revoke all on table public.product_copy_items from anon, authenticated;
grant select, insert, update on table public.product_copy_runs to authenticated;
grant select, insert, update on table public.product_copy_items to authenticated;

drop policy if exists "product copy runs owner select" on public.product_copy_runs;
create policy "product copy runs owner select" on public.product_copy_runs
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "product copy runs owner insert" on public.product_copy_runs;
create policy "product copy runs owner insert" on public.product_copy_runs
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "product copy runs owner update" on public.product_copy_runs;
create policy "product copy runs owner update" on public.product_copy_runs
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "product copy items owner select" on public.product_copy_items;
create policy "product copy items owner select" on public.product_copy_items
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "product copy items owner insert" on public.product_copy_items;
create policy "product copy items owner insert" on public.product_copy_items
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "product copy items owner update" on public.product_copy_items;
create policy "product copy items owner update" on public.product_copy_items
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
