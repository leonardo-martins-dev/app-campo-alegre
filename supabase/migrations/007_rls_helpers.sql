-- Campo Alegre — 007: funções helper para RLS (schema private)

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.get_user_nivel()
RETURNS public.nivel_acesso
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.nivel_acesso
  FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.ativo = true;
$$;

CREATE OR REPLACE FUNCTION private.get_user_loja_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.loja_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.ativo = true;
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.get_user_nivel() = 'admin'::public.nivel_acesso;
$$;

CREATE OR REPLACE FUNCTION private.is_administracao_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.get_user_nivel() IN (
    'administracao'::public.nivel_acesso,
    'admin'::public.nivel_acesso
  );
$$;

CREATE OR REPLACE FUNCTION private.is_supervisor_or_above()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT private.get_user_nivel() IN (
    'supervisor'::public.nivel_acesso,
    'administracao'::public.nivel_acesso,
    'admin'::public.nivel_acesso
  );
$$;

CREATE OR REPLACE FUNCTION private.can_access_loja(target_loja_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    private.is_administracao_or_admin()
    OR (
      private.get_user_loja_id() IS NOT NULL
      AND private.get_user_loja_id() = target_loja_id
    );
$$;

REVOKE ALL ON FUNCTION private.get_user_nivel() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_user_loja_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_administracao_or_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_supervisor_or_above() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_access_loja(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.get_user_nivel() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_user_loja_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_administracao_or_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_supervisor_or_above() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_access_loja(uuid) TO authenticated, service_role;
