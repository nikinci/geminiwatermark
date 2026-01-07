-- FINAL LOGIC FIX (V3)
-- Ensures 'referred_by' is set even if the profile was already created by the Reward Script.

create or replace function public.handle_new_user_v2()
returns trigger as $$
declare
  ref_code text;
  referrer_id uuid;
  new_referral_code text;
begin
  -- Get referral code from metadata if present
  ref_code := new.raw_user_meta_data->>'referral_code';
  
  -- Generate user's own code
  new_referral_code := generate_unique_referral_code();

  -- Find referrer if code exists (Who invited this user?)
  if ref_code is not null then
    select id into referrer_id from profiles where referral_code = ref_code;
  end if;

  -- Insert profile (UPSERT)
  insert into public.profiles (id, email, referral_code, referred_by)
  values (
    new.id, 
    new.email,
    new_referral_code,
    referrer_id -- Value is set here for fresh inserts
  )
  on conflict (id) do update
  set 
    -- If profile exists (from Reward Script), we MUST update these fields:
    referral_code = coalesce(profiles.referral_code, excluded.referral_code),
    referred_by = coalesce(profiles.referred_by, excluded.referred_by); -- <--- THE FIX
  
  -- If there was a valid referrer, reward them
  if referrer_id is not null then
    perform apply_referral_reward(referrer_id); -- Reward Inviter (1 Week)
    perform apply_referral_reward(new.id);      -- Reward Invitee (1 Week)
  end if;

  return new;
end;
$$ language plpgsql security definer;
