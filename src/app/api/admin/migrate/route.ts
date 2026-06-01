import { NextResponse } from 'next/server'

// One-time migration runner — will be deleted after successful run
export async function POST(request: Request) {
  const secret = request.headers.get('x-migration-secret')
  if (!secret || secret !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const migration = `
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'individual', 'couple', 'family')),
  partner_id uuid references public.users(id),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  interview_data jsonb not null default '{}',
  shadow_vision text,
  daily_template jsonb,
  pillars jsonb,
  gym_program jsonb,
  reading_list jsonb,
  travel_plan jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  month_number int not null check (month_number between 1 and 18),
  month_label text not null,
  phase text not null check (phase in ('Foundation', 'Build', 'Launch', 'Scale')),
  phase_color text not null default '#C8A84B',
  pills jsonb not null default '[]',
  family_items jsonb not null default '[]',
  gym_items jsonb not null default '[]',
  reading_items jsonb not null default '[]',
  event_items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_number)
);

create table if not exists public.milestones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  month_target int not null,
  title text not null,
  description text not null,
  pillar text not null check (pillar in ('business', 'personal', 'family', 'body', 'mind')),
  achieved_at timestamptz,
  tags jsonb not null default '[]'
);

create table if not exists public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('weekly', 'monthly')),
  week_number int,
  month_number int,
  family_score int check (family_score between 1 and 5),
  body_score int check (body_score between 1 and 5),
  mind_score int check (mind_score between 1 and 5),
  work_score int check (work_score between 1 and 5),
  notes text,
  ai_insight text,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_workspaces (
  id uuid primary key default uuid_generate_v4(),
  partner_a uuid not null references public.users(id) on delete cascade,
  partner_b uuid not null references public.users(id) on delete cascade,
  shared_vision text,
  shared_goals jsonb not null default '{}',
  connection_plan jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('onboarding', 'checkin', 'chat')),
  messages jsonb not null default '[]',
  summary text,
  created_at timestamptz not null default now()
);

alter table if exists public.users enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.monthly_plans enable row level security;
alter table if exists public.milestones enable row level security;
alter table if exists public.checkins enable row level security;
alter table if exists public.couple_workspaces enable row level security;
alter table if exists public.conversations enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='users_own') then
    create policy "users_own" on public.users for all using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_own') then
    create policy "profiles_own" on public.profiles for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='monthly_plans' and policyname='monthly_plans_own') then
    create policy "monthly_plans_own" on public.monthly_plans for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='milestones' and policyname='milestones_own') then
    create policy "milestones_own" on public.milestones for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='checkins' and policyname='checkins_own') then
    create policy "checkins_own" on public.checkins for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='conversations' and policyname='conversations_own') then
    create policy "conversations_own" on public.conversations for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='couple_workspaces' and policyname='couple_workspace_access') then
    create policy "couple_workspace_access" on public.couple_workspaces
      for all using (auth.uid() = partner_a or auth.uid() = partner_b);
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_monthly_plans_updated_at on public.monthly_plans;
create trigger set_monthly_plans_updated_at before update on public.monthly_plans
  for each row execute procedure public.set_updated_at();
`

  const res = await fetch(`${supabaseUrl}/pg-meta/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'x-pg-meta-allow-dangerous-queries': 'true',
    },
    body: JSON.stringify({ query: migration }),
  })

  const result = await res.json()

  if (!res.ok) {
    return NextResponse.json({ success: false, error: result }, { status: 500 })
  }

  return NextResponse.json({ success: true, result })
}
