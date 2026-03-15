-- =============================================================================
-- SaaSPilot — Initial Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";


-- =============================================================================
-- TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid        primary key references auth.users (id) on delete cascade,
  email        text        not null,
  display_name text,
  avatar_url   text,
  plan         text        not null default 'free' check (plan in ('free', 'starter', 'pro')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. integrations
-- ---------------------------------------------------------------------------
create table public.integrations (
  id                 uuid        primary key default uuid_generate_v4(),
  user_id            uuid        not null references public.profiles (id) on delete cascade,
  provider           text        not null check (provider in ('stripe', 'google_analytics', 'plausible')),
  access_token       text        not null,
  refresh_token      text,
  scope              text,
  stripe_account_id  text,
  connected_at       timestamptz not null default now(),
  expires_at         timestamptz,
  is_active          boolean     not null default true
);

-- ---------------------------------------------------------------------------
-- 3. products
-- ---------------------------------------------------------------------------
create table public.products (
  id                 uuid        primary key default uuid_generate_v4(),
  user_id            uuid        not null references public.profiles (id) on delete cascade,
  name               text        not null,
  stripe_account_id  text,
  domain             text,
  is_active          boolean     not null default true,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. metrics_stripe
-- ---------------------------------------------------------------------------
create table public.metrics_stripe (
  id                 uuid        primary key default uuid_generate_v4(),
  product_id         uuid        not null references public.products (id) on delete cascade,
  date               date        not null,
  mrr                numeric     not null default 0,
  churn_rate         numeric     not null default 0,
  new_customers      integer     not null default 0,
  churned_customers  integer     not null default 0,
  active_customers   integer     not null default 0,
  arpu               numeric     not null default 0,
  ltv                numeric     not null default 0,
  revenue            numeric     not null default 0,
  created_at         timestamptz not null default now(),

  constraint metrics_stripe_product_date_unique unique (product_id, date)
);

-- ---------------------------------------------------------------------------
-- 5. alerts
-- ---------------------------------------------------------------------------
create table public.alerts (
  id                uuid        primary key default uuid_generate_v4(),
  user_id           uuid        not null references public.profiles (id) on delete cascade,
  product_id        uuid        references public.products (id) on delete cascade,
  metric            text        not null check (metric in (
                                  'mrr', 'churn_rate', 'new_customers',
                                  'churned_customers', 'active_customers',
                                  'arpu', 'ltv', 'revenue'
                                )),
  condition         text        not null check (condition in ('above', 'below', 'equals')),
  threshold         numeric     not null,
  channel           text        not null default 'email',
  is_active         boolean     not null default true,
  last_triggered_at timestamptz,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  product_id  uuid        references public.products (id) on delete cascade,
  type        text        not null check (type in ('weekly', 'monthly')),
  data        jsonb       not null default '{}',
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- integrations
create index integrations_user_id_idx        on public.integrations  (user_id);
create index integrations_provider_idx        on public.integrations  (provider);

-- products
create index products_user_id_idx            on public.products      (user_id);

-- metrics_stripe
create index metrics_stripe_product_id_idx   on public.metrics_stripe (product_id);
create index metrics_stripe_date_idx         on public.metrics_stripe (date desc);
create index metrics_stripe_product_date_idx on public.metrics_stripe (product_id, date desc);

-- alerts
create index alerts_user_id_idx              on public.alerts        (user_id);
create index alerts_product_id_idx           on public.alerts        (product_id);
create index alerts_is_active_idx            on public.alerts        (is_active) where is_active = true;

-- reports
create index reports_user_id_idx             on public.reports       (user_id);
create index reports_product_id_idx          on public.reports       (product_id);


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- updated_at auto-update on profiles
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile when a user signs up via Supabase Auth
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles       enable row level security;
alter table public.integrations   enable row level security;
alter table public.products       enable row level security;
alter table public.metrics_stripe enable row level security;
alter table public.alerts         enable row level security;
alter table public.reports        enable row level security;

-- ---------------------------------------------------------------------------
-- profiles — user owns their own row (id = auth.uid())
-- ---------------------------------------------------------------------------
create policy "profiles: select own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: insert own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: delete own"
  on public.profiles for delete
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- integrations — user_id = auth.uid()
-- ---------------------------------------------------------------------------
create policy "integrations: select own"
  on public.integrations for select
  using (user_id = auth.uid());

create policy "integrations: insert own"
  on public.integrations for insert
  with check (user_id = auth.uid());

create policy "integrations: update own"
  on public.integrations for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "integrations: delete own"
  on public.integrations for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- products — user_id = auth.uid()
-- ---------------------------------------------------------------------------
create policy "products: select own"
  on public.products for select
  using (user_id = auth.uid());

create policy "products: insert own"
  on public.products for insert
  with check (user_id = auth.uid());

create policy "products: update own"
  on public.products for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "products: delete own"
  on public.products for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- metrics_stripe — join via products to verify ownership
-- ---------------------------------------------------------------------------
create policy "metrics_stripe: select own"
  on public.metrics_stripe for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.user_id = auth.uid()
    )
  );

create policy "metrics_stripe: insert own"
  on public.metrics_stripe for insert
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.user_id = auth.uid()
    )
  );

create policy "metrics_stripe: update own"
  on public.metrics_stripe for update
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.user_id = auth.uid()
    )
  );

create policy "metrics_stripe: delete own"
  on public.metrics_stripe for delete
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- alerts — user_id = auth.uid()
-- ---------------------------------------------------------------------------
create policy "alerts: select own"
  on public.alerts for select
  using (user_id = auth.uid());

create policy "alerts: insert own"
  on public.alerts for insert
  with check (user_id = auth.uid());

create policy "alerts: update own"
  on public.alerts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "alerts: delete own"
  on public.alerts for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reports — user_id = auth.uid()
-- ---------------------------------------------------------------------------
create policy "reports: select own"
  on public.reports for select
  using (user_id = auth.uid());

create policy "reports: insert own"
  on public.reports for insert
  with check (user_id = auth.uid());

create policy "reports: update own"
  on public.reports for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reports: delete own"
  on public.reports for delete
  using (user_id = auth.uid());
