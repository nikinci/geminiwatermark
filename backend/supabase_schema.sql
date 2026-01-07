-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  is_pro boolean default false,
  subscription_id text,
  customer_id text,
  credits int default 3,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updates for Referral System

-- Add new columns to profiles
alter table profiles 
add column if not exists referral_code text unique,
add column if not exists referred_by uuid references profiles(id),
add column if not exists pro_expires_at timestamp with time zone;

-- Function to generate unique referral code
create or replace function generate_unique_referral_code()
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean;
begin
  loop
    result := '';
    for i in 1..8 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    end loop;
    
    select exists(select 1 from profiles where referral_code = result) into code_exists;
    exit when not code_exists;
  end loop;
  return result;
end;
$$ language plpgsql;

-- Function to apply referral reward (1 week extension)
create or replace function apply_referral_reward(inviter_id uuid)
returns void as $$
begin
  update profiles
  set pro_expires_at = greatest(
    coalesce(pro_expires_at, now()), 
    now()
  ) + interval '7 days'
  where id = inviter_id;
end;
$$ language plpgsql security definer;

-- Updated handle_new_user function to include referral logic
create or replace function public.handle_new_user()
returns trigger as $$
declare
  ref_code text;
  referrer_id uuid;
begin
  -- Get referral code from metadata if present
  ref_code := new.raw_user_meta_data->>'referral_code';
  
  -- Find referrer if code exists
  if ref_code is not null then
    select id into referrer_id from profiles where referral_code = ref_code;
  end if;

  insert into public.profiles (id, email, referral_code, referred_by)
  values (
    new.id, 
    new.email,
    generate_unique_referral_code(),
    referrer_id
  );
  
  -- If there was a valid referrer, reward them
  if referrer_id is not null then
    perform apply_referral_reward(referrer_id); -- Reward Inviter (1 Week)
    perform apply_referral_reward(new.id);      -- Reward Invitee (1 Week)
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Function to grant Early Adopter Pro (1 Month)
create or replace function grant_early_adopter_pro(user_email text)
returns void as $$
begin
  update profiles
  set 
    pro_expires_at = greatest(coalesce(pro_expires_at, now()), now()) + interval '1 month'
  where email = user_email;
end;
$$ language plpgsql security definer;

-- SECURITY: Revoke access from public, only allow service_role
REVOKE EXECUTE ON FUNCTION grant_early_adopter_pro(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION grant_early_adopter_pro(text) FROM anon;
REVOKE EXECUTE ON FUNCTION grant_early_adopter_pro(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION grant_early_adopter_pro(text) TO service_role;

