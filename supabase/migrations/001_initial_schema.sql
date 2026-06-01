-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'individual', 'couple', 'family')),
  partner_id uuid references public.users(id),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

-- Profiles (interview output + generated plan)
create table public.profiles (
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

-- Monthly plans (18 rows per user)
create table public.monthly_plans (
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

-- Milestones
create table public.milestones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  month_target int not null,
  title text not null,
  description text not null,
  pillar text not null check (pillar in ('business', 'personal', 'family', 'body', 'mind')),
  achieved_at timestamptz,
  tags jsonb not null default '[]'
);

-- Check-ins
create table public.checkins (
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

-- Couple workspaces
create table public.couple_workspaces (
  id uuid primary key default uuid_generate_v4(),
  partner_a uuid not null references public.users(id) on delete cascade,
  partner_b uuid not null references public.users(id) on delete cascade,
  shared_vision text,
  shared_goals jsonb not null default '{}',
  connection_plan jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- AI conversation history
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('onboarding', 'checkin', 'chat')),
  messages jsonb not null default '[]',
  summary text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.monthly_plans enable row level security;
alter table public.milestones enable row level security;
alter table public.checkins enable row level security;
alter table public.couple_workspaces enable row level security;
alter table public.conversations enable row level security;

-- RLS policies (users own their own data)
create policy "users_own" on public.users for all using (auth.uid() = id);
create policy "profiles_own" on public.profiles for all using (auth.uid() = user_id);
create policy "monthly_plans_own" on public.monthly_plans for all using (auth.uid() = user_id);
create policy "milestones_own" on public.milestones for all using (auth.uid() = user_id);
create policy "checkins_own" on public.checkins for all using (auth.uid() = user_id);
create policy "conversations_own" on public.conversations for all using (auth.uid() = user_id);

-- Couple workspace: both partners can read/write
create policy "couple_workspace_access" on public.couple_workspaces
  for all using (auth.uid() = partner_a or auth.uid() = partner_b);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_monthly_plans_updated_at before update on public.monthly_plans
  for each row execute procedure public.set_updated_at();
