-- EXPLICIT Referral Claim Function (V4.2 - E-mail Fix)
-- Fixes NULL email by accepting email as argument.

create or replace function claim_referral(code text, user_email text)
returns json as $$
declare
  referrer_id uuid;
  success boolean := false;
  message text := '';
  new_referral_code text;
begin
  -- 1. Check if user already has a referrer
  if exists (select 1 from profiles where id = auth.uid() and referred_by is not null) then
    return json_build_object('success', false, 'message', 'User already referred');
  end if;

  -- 2. Find the referrer
  select id into referrer_id from profiles where referral_code = code;
  
  if referrer_id is null then
    return json_build_object('success', false, 'message', 'Invalid referral code');
  end if;

  -- 3. Prevent self-referral
  if referrer_id = auth.uid() then
    return json_build_object('success', false, 'message', 'Cannot refer yourself');
  end if;

  -- 4. UPSERT the profile with EMAIL
  new_referral_code := generate_unique_referral_code();

  insert into profiles (id, email, referral_code, referred_by, updated_at)
  values (auth.uid(), user_email, new_referral_code, referrer_id, now())
  on conflict (id) do update
  set referred_by = excluded.referred_by,
      email = excluded.email, -- Ensure email is updated if missing
      updated_at = now()
  where profiles.referred_by is null;

  -- 5. Give rewards
  if found then
    perform apply_referral_reward(referrer_id); -- Reward Inviter
    perform apply_referral_reward(auth.uid());  -- Reward Invitee
    success := true;
    message := 'Referral claimed successfully';
  else
    success := false;
    message := 'Profile update skipped (User might already be referred)';
  end if;

  return json_build_object('success', success, 'message', message);
end;
$$ language plpgsql security definer;

GRANT EXECUTE ON FUNCTION claim_referral(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_referral(text, text) TO service_role;
