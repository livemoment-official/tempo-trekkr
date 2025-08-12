-- Re-run full migration with compatible policy syntax
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  name text,
  bio text,
  mood text,
  job_title text,
  relationship_status text,
  interests text[],
  preferred_moments text[],
  avatar_url text,
  gallery text[],
  instagram_username text,
  location jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using ( auth.uid() = id );

create or replace trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- FRIENDSHIPS
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now()
);

alter table public.friendships add constraint if not exists friendships_not_self check (user_id <> friend_user_id);
create unique index if not exists friendships_unique_pair on public.friendships (
  least(user_id, friend_user_id), greatest(user_id, friend_user_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Users can select their friendships" on public.friendships;
create policy "Users can select their friendships"
  on public.friendships for select using ( auth.uid() in (user_id, friend_user_id) );

drop policy if exists "Users can create friendship requests" on public.friendships;
create policy "Users can create friendship requests"
  on public.friendships for insert with check ( auth.uid() = user_id );

drop policy if exists "Either party can update friendship status" on public.friendships;
create policy "Either party can update friendship status"
  on public.friendships for update using ( auth.uid() in (user_id, friend_user_id) );

-- INVITES
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  place jsonb,
  when_at timestamptz,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  participants uuid[] default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invites enable row level security;

drop policy if exists "Host or participants can view invites" on public.invites;
create policy "Host or participants can view invites"
  on public.invites for select using ( auth.uid() = host_id or auth.uid() = any(participants) );

drop policy if exists "Host can create invites" on public.invites;
create policy "Host can create invites"
  on public.invites for insert with check ( auth.uid() = host_id );

drop policy if exists "Host or participants can update invites" on public.invites;
create policy "Host or participants can update invites"
  on public.invites for update using ( auth.uid() = host_id or auth.uid() = any(participants) );

create or replace trigger set_invites_updated_at
before update on public.invites
for each row execute function public.set_updated_at();

-- MOMENTS
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  place jsonb,
  when_at timestamptz,
  capacity int,
  tags text[],
  is_public boolean not null default false,
  participants uuid[] default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.moments enable row level security;

drop policy if exists "Public or permitted can view moments" on public.moments;
create policy "Public or permitted can view moments"
  on public.moments for select using (
    is_public = true or auth.uid() = host_id or auth.uid() = any(participants)
  );

drop policy if exists "Host can create moments" on public.moments;
create policy "Host can create moments"
  on public.moments for insert with check ( auth.uid() = host_id );

drop policy if exists "Host can update moments" on public.moments;
create policy "Host can update moments"
  on public.moments for update using ( auth.uid() = host_id );

create or replace trigger set_moments_updated_at
before update on public.moments
for each row execute function public.set_updated_at();

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  place jsonb,
  when_at timestamptz,
  capacity int,
  tags text[],
  discovery_on boolean not null default true,
  ticketing jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "Events are viewable by everyone when discovery_on" on public.events;
create policy "Events are viewable by everyone when discovery_on"
  on public.events for select using ( discovery_on = true );

drop policy if exists "Hosts can manage their events" on public.events;
create policy "Hosts can manage their events"
  on public.events for all using ( auth.uid() = host_id ) with check ( auth.uid() = host_id );

create or replace trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- AVAILABILITY
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_at timestamptz,
  end_at timestamptz,
  is_on boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.availability enable row level security;

drop policy if exists "Users can view their availability" on public.availability;
create policy "Users can view their availability"
  on public.availability for select using ( auth.uid() = user_id );

drop policy if exists "Users manage their availability" on public.availability;
create policy "Users manage their availability"
  on public.availability for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

create or replace trigger set_availability_updated_at
before update on public.availability
for each row execute function public.set_updated_at();

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('galleries','galleries', true)
on conflict (id) do nothing;

-- STORAGE POLICIES (drop+create)
-- Avatars
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select using ( bucket_id = 'avatars' );

drop policy if exists "Users manage own avatars" on storage.objects;
create policy "Users manage own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own avatars" on storage.objects;
create policy "Users update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Galleries
drop policy if exists "Public read galleries" on storage.objects;
create policy "Public read galleries"
  on storage.objects for select using ( bucket_id = 'galleries' );

drop policy if exists "Users manage own galleries insert" on storage.objects;
create policy "Users manage own galleries insert"
  on storage.objects for insert
  with check (
    bucket_id = 'galleries' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users manage own galleries update" on storage.objects;
create policy "Users manage own galleries update"
  on storage.objects for update
  using (
    bucket_id = 'galleries' and auth.uid()::text = (storage.foldername(name))[1]
  );