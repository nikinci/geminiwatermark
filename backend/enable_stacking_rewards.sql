-- 1. Add Tracking Column
alter table profiles add column if not exists is_early_adopter boolean default false;

-- 2. Update Reward Function to use the flag and stack time correctly
create or replace function grant_early_adopter_pro(user_email text, user_uuid uuid)
returns void as $$
begin
  insert into public.profiles (
    id, 
    email, 
    pro_expires_at, 
    referral_code,
    is_early_adopter, -- Mark as early adopter on creation
    updated_at
  )
  values (
    user_uuid, 
    user_email, 
    now() + interval '1 month',
    generate_unique_referral_code(),
    true, -- True
    now()
  )
  on conflict (id) do update
  set 
    -- ADD 1 month to whatever they have (Stacking Logic)
    pro_expires_at = greatest(coalesce(profiles.pro_expires_at, now()), now()) + interval '1 month',
    referral_code = coalesce(profiles.referral_code, generate_unique_referral_code()),
    is_early_adopter = true, -- Mark as true on update
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Permissions
GRANT EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) TO service_role;
