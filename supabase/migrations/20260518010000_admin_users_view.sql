-- Create a secure view/function to get all users including auth data
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  email varchar,
  full_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamptz,
  last_sign_in_at timestamptz
) 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::varchar,
    p.full_name,
    p.phone,
    p.address,
    p.city,
    p.postal_code,
    p.country,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id;
END;
$$;

-- Create function to securely delete a user for admins
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Ensure we don't delete ourselves
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own admin account';
  END IF;

  -- Delete from auth.users (cascades to profiles and other public tables if foreign keys are set up with CASCADE)
  -- Need to delete from public tables first if CASCADE is not set up
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
