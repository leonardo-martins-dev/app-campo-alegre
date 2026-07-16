-- Campo Alegre — telefone + vínculo N:N usuário↔lojas

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telefone text;

CREATE TABLE IF NOT EXISTS public.usuario_lojas (
  usuario_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  loja_id uuid NOT NULL REFERENCES public.lojas (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, loja_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_lojas_loja ON public.usuario_lojas (loja_id);

-- Migrar loja_id atual para usuario_lojas
INSERT INTO public.usuario_lojas (usuario_id, loja_id)
SELECT id, loja_id
FROM public.profiles
WHERE loja_id IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE public.usuario_lojas ENABLE ROW LEVEL SECURITY;

CREATE POLICY usuario_lojas_select ON public.usuario_lojas
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR private.is_supervisor_or_above()
  );

CREATE POLICY usuario_lojas_admin_write ON public.usuario_lojas
  FOR ALL TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());

-- Admin + administração podem gerir lojas e profiles
DROP POLICY IF EXISTS lojas_admin_all ON public.lojas;
CREATE POLICY lojas_admin_all ON public.lojas
  FOR ALL TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());

DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());

-- Acesso a loja: primary loja_id OU usuario_lojas
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
    )
    OR EXISTS (
      SELECT 1
      FROM public.usuario_lojas ul
      WHERE ul.usuario_id = auth.uid()
        AND ul.loja_id = target_loja_id
    );
$$;
