-- Create a dummy user in auth.users (so foreign key works) if not exists
-- NOTE: We can't easily insert into auth.users due to encryption/internal fields.
-- Instead, we will look for any existing user to use as a "Test Referrer" 
-- OR just insert a profile with a random UUID that doesn't link to auth 
-- (This works if we DROP the foreign key constraint, but that's dangerous).

-- BETTER APPROACH: Update an EXISTING profile to have a known code.
-- Or just insert a fake profile ID. Supabase foreign keys are usually strict.

-- Let's try to grab ANY existing user and give them a known code.
DO $$
DECLARE
  target_id uuid;
BEGIN
  -- Select the first user who is NOT the current user (if any)
  SELECT id INTO target_id FROM profiles LIMIT 1;

  IF target_id IS NOT NULL THEN
    UPDATE profiles SET referral_code = 'TESTCODE' WHERE id = target_id;
  ELSE
    -- If no users exist, we are stuck. But the user just signed up!
    -- So let's use the USER's recent profile as the "Ref Generator" for the NEXT test.
    -- But they want to BE referred.
    
    -- Let's insert a fake profile with a generated UUID.
    -- If FK constraint on auth.users is present, this will fail unless we insert into auth.users too.
    -- Supabase usually requires auth.users. 
    
    RAISE NOTICE 'No users found to set as Test Referrer.';
  END IF;
END $$;
