-- Create profiles table for storing user data
create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  username text unique,
  avatar_url text,
  bio text,
  interests text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Update updated_at automatically on update
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- Helpful index for username lookups
create index if not exists idx_profiles_username on public.profiles (username);