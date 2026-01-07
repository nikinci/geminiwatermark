-- 1. Ensure Profiles Table & Columns Exist
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  is_pro boolean default false,
  subscription_id text,
  customer_id text,
  credits int default 3,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid references profiles(id);
alter table profiles add column if not exists pro_expires_at timestamp with time zone;

alter table profiles enable row level security;

-- 2. Helper Functions (MUST exist for trigger to work)

-- Generate Referral Code
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

-- Apply Referral Reward
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

-- Grant Early Adopter Pro (UPSERT Version)
create or replace function grant_early_adopter_pro(user_email text, user_uuid uuid)
returns void as $$
begin
  insert into public.profiles (id, email, pro_expires_at, updated_at)
  values (
    user_uuid, 
    user_email, 
    now() + interval '1 month',
    now()
  )
  on conflict (id) do update
  set 
    pro_expires_at = greatest(coalesce(profiles.pro_expires_at, now()), now()) + interval '1 month',
    updated_at = now();
end;
$$ language plpgsql security definer;

-- 3. The Main Trigger Function (Updated)
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

  -- Insert profile (UPSERT to be safe)
  insert into public.profiles (id, email, referral_code, referred_by)
  values (
    new.id, 
    new.email,
    generate_unique_referral_code(),
    referrer_id
  )
  on conflict (id) do nothing;
  
  -- If there was a valid referrer, reward them
  if referrer_id is not null then
    perform apply_referral_reward(referrer_id); -- Reward Inviter (1 Week)
    perform apply_referral_reward(new.id);      -- Reward Invitee (1 Week)
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 4. Re-Attach Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Permissions
GRANT EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) TO service_role;
