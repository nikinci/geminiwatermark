-- Update function to support UPSERT (Insert if not exists, otherwise Update)
-- Drops the old function signature first to avoid ambiguity if we change args
DROP FUNCTION IF EXISTS public.grant_early_adopter_pro(text);

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

-- Re-grant permissions (since we dropped/recreated)
REVOKE EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION grant_early_adopter_pro(text, uuid) TO service_role;
