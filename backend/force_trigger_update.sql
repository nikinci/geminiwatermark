-- 1. Ensure Dependencies Exist (Safe Re-run)
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

-- 2. Create NEW Function Version (V2) to ensure no caching/overwrite issues
create or replace function public.handle_new_user_v2()
returns trigger as $$
declare
  ref_code text;
  referrer_id uuid;
  new_referral_code text;
begin
  -- Get referral code from metadata if present
  ref_code := new.raw_user_meta_data->>'referral_code';
  
  -- Generates code. If this fails, the whole transaction aborts, which is good.
  new_referral_code := generate_unique_referral_code();

  -- Find referrer if code exists
  if ref_code is not null then
    select id into referrer_id from profiles where referral_code = ref_code;
  end if;

  -- Insert profile (UPSERT to be safe)
  insert into public.profiles (id, email, referral_code, referred_by)
  values (
    new.id, 
    new.email,
    new_referral_code,
    referrer_id
  )
  on conflict (id) do update
  set referral_code = excluded.referral_code; -- Force update ref code if profile exists
  
  -- If there was a valid referrer, reward them
  if referrer_id is not null then
    perform apply_referral_reward(referrer_id); -- Reward Inviter (1 Week)
    perform apply_referral_reward(new.id);      -- Reward Invitee (1 Week)
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 3. Update Trigger to use V2
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_v2();

-- 4. Clean up old function (optional but good hygiene)
drop function if exists public.handle_new_user();
