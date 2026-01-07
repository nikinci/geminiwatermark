-- SAFE TRIGGER WRAPPER (V4)
-- This implementation WRAPS the logic in an exception block.
-- If the referral logic fails, the user is still created, preventing "Database error saving new user".

create or replace function public.handle_new_user_v2()
returns trigger as $$
declare
  ref_code text;
  referrer_id uuid;
  new_referral_code text;
begin
  -- Start a sub-block for error handling
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
        referrer_id
      )
      on conflict (id) do update
      set 
        referral_code = coalesce(profiles.referral_code, excluded.referral_code),
        referred_by = coalesce(profiles.referred_by, excluded.referred_by);
      
      -- If there was a valid referrer, reward them
      if referrer_id is not null then
        perform apply_referral_reward(referrer_id); -- Reward Inviter (1 Week)
        perform apply_referral_reward(new.id);      -- Reward Invitee (1 Week)
      end if;

  exception when others then
      -- IF ANYTHING FAILS, we log it (if we had a logs table) and continue.
      -- Supabase logs will show this RAISE WARNING.
      RAISE WARNING 'Handle New User Trigger FAILED for user %: %', new.id, SQLERRM;
      
      -- Fallback: Ensure profile is at least created if the upsert failed above due to some complex constraint
      -- We MUST ensure they have a referral_code, otherwise they can't invite others.
      begin
          -- Re-attempt generation in fallback (or use the one from above if it didn't fail)
          if new_referral_code is null then
             new_referral_code := generate_unique_referral_code();
          end if;

          insert into public.profiles (id, email, referral_code) 
          values (new.id, new.email, new_referral_code)
          on conflict (id) do update
          set referral_code = coalesce(profiles.referral_code, excluded.referral_code);
          
      exception when others then
          -- Absolute last resort: do nothing, just let auth user exist.
          null;
      end;
  end;

  return new;
end;
$$ language plpgsql security definer;
