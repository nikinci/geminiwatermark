-- Final Logic Fix: Making the Reward Function "Smart"
-- This solves the race condition where the Reward script creates the user before the Trigger.

create or replace function grant_early_adopter_pro(user_email text, user_uuid uuid)
returns void as $$
begin
  insert into public.profiles (
    id, 
    email, 
    pro_expires_at, 
    referral_code, -- <--- Critical Addition
    updated_at
  )
  values (
    user_uuid, 
    user_email, 
    now() + interval '1 month',
    generate_unique_referral_code(), -- <--- Generate code if WE are creating the user
    now()
  )
  on conflict (id) do update
  set 
    pro_expires_at = greatest(coalesce(profiles.pro_expires_at, now()), now()) + interval '1 month',
    -- Also fix missing referral code if it exists but is null
    referral_code = coalesce(profiles.referral_code, generate_unique_referral_code()),
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Ensure permissions
GRANT EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) TO service_role;
