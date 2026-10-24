-- ============================================================================
-- Migration: 00054_repoint_auth_users_foreign_keys.sql
-- Description: TalentSphere owns its identities (decision D4): accounts live in
--              public.users, and sessions are issued by the API, not by
--              Supabase Auth. Migrations 00016, 00018, 00022 and 00023 declared
--              foreign keys to auth.users(id), which on hosted Supabase is the
--              platform's own user table and never holds TalentSphere accounts,
--              so every insert into those tables would be rejected. This points
--              each such key at public.users(id), keeping its name and its
--              ON DELETE behaviour. Earlier migrations are left untouched so
--              their recorded checksums stay valid. Idempotent: a database with
--              no remaining keys to auth.users changes nothing.
-- ============================================================================

DO $$
DECLARE
  fk RECORD;
  delete_action TEXT;
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RETURN;
  END IF;

  FOR fk IN
    SELECT c.conname,
           c.conrelid::regclass AS table_name,
           a.attname AS column_name,
           c.confdeltype
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    WHERE c.contype = 'f'
      AND c.confrelid = 'auth.users'::regclass
      AND c.connamespace = 'public'::regnamespace
      AND array_length(c.conkey, 1) = 1
  LOOP
    delete_action := CASE fk.confdeltype
      WHEN 'c' THEN 'CASCADE'
      WHEN 'n' THEN 'SET NULL'
      WHEN 'd' THEN 'SET DEFAULT'
      WHEN 'r' THEN 'RESTRICT'
      ELSE 'NO ACTION'
    END;

    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.table_name, fk.conname);
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.users(id) ON DELETE %s',
      fk.table_name, fk.conname, fk.column_name, delete_action
    );
  END LOOP;
END
$$;
