-- Campo Alegre — 008: Row Level Security e policies

ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canhotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canhotos_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimento_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divergencias ENABLE ROW LEVEL SECURITY;

-- LOJAS
CREATE POLICY lojas_select ON public.lojas
  FOR SELECT TO authenticated
  USING (
    ativa = true
    OR private.is_administracao_or_admin()
  );

CREATE POLICY lojas_admin_all ON public.lojas
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- PROFILES
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR private.is_supervisor_or_above()
  );

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- CONVITES (apenas admin)
CREATE POLICY convites_admin_select ON public.convites
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY convites_admin_insert ON public.convites
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY convites_admin_update ON public.convites
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- CANHOTOS
CREATE POLICY canhotos_select ON public.canhotos
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR private.can_access_loja(loja_id)
    OR private.is_administracao_or_admin()
  );

CREATE POLICY canhotos_insert ON public.canhotos
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND private.get_user_nivel() IN ('colaborador', 'supervisor', 'admin')
  );

CREATE POLICY canhotos_update ON public.canhotos
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid()
    OR (
      private.get_user_nivel() = 'supervisor'
      AND private.can_access_loja(loja_id)
    )
    OR private.is_administracao_or_admin()
  )
  WITH CHECK (
    usuario_id = auth.uid()
    OR private.is_supervisor_or_above()
  );

-- CANHOTOS SISTEMA
CREATE POLICY canhotos_sistema_select ON public.canhotos_sistema
  FOR SELECT TO authenticated
  USING (
    private.can_access_loja(loja_id)
    OR private.is_administracao_or_admin()
  );

CREATE POLICY canhotos_sistema_admin_write ON public.canhotos_sistema
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- PROCEDIMENTOS
CREATE POLICY procedimentos_select ON public.procedimentos
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR private.can_access_loja(loja_id)
    OR private.is_administracao_or_admin()
  );

CREATE POLICY procedimentos_insert ON public.procedimentos
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND private.get_user_nivel() IN ('colaborador', 'admin')
  );

CREATE POLICY procedimentos_update ON public.procedimentos
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid()
    OR (
      private.get_user_nivel() = 'supervisor'
      AND private.can_access_loja(loja_id)
    )
    OR private.is_administracao_or_admin()
  )
  WITH CHECK (true);

-- PROCEDIMENTO ITENS (via procedimento pai)
CREATE POLICY procedimento_itens_select ON public.procedimento_itens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.procedimentos pr
      WHERE pr.id = procedimento_id
        AND (
          pr.usuario_id = auth.uid()
          OR private.can_access_loja(pr.loja_id)
          OR private.is_administracao_or_admin()
        )
    )
  );

CREATE POLICY procedimento_itens_write ON public.procedimento_itens
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.procedimentos pr
      WHERE pr.id = procedimento_id
        AND pr.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.procedimentos pr
      WHERE pr.id = procedimento_id
        AND pr.usuario_id = auth.uid()
    )
  );

-- PROCEDIMENTO FOTOS
CREATE POLICY procedimento_fotos_select ON public.procedimento_fotos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.procedimentos pr
      WHERE pr.id = procedimento_id
        AND (
          pr.usuario_id = auth.uid()
          OR private.can_access_loja(pr.loja_id)
          OR private.is_administracao_or_admin()
        )
    )
  );

CREATE POLICY procedimento_fotos_write ON public.procedimento_fotos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.procedimentos pr
      WHERE pr.id = procedimento_id
        AND pr.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.procedimentos pr
      WHERE pr.id = procedimento_id
        AND pr.usuario_id = auth.uid()
    )
  );

-- CONFERENCIAS
CREATE POLICY conferencias_select ON public.conferencias
  FOR SELECT TO authenticated
  USING (private.is_supervisor_or_above());

CREATE POLICY conferencias_insert ON public.conferencias
  FOR INSERT TO authenticated
  WITH CHECK (
    conferido_por = auth.uid()
    AND private.is_supervisor_or_above()
  );

CREATE POLICY conferencias_update ON public.conferencias
  FOR UPDATE TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());

-- DIVERGENCIAS
CREATE POLICY divergencias_select ON public.divergencias
  FOR SELECT TO authenticated
  USING (private.is_supervisor_or_above());

CREATE POLICY divergencias_insert ON public.divergencias
  FOR INSERT TO authenticated
  WITH CHECK (private.is_supervisor_or_above());

CREATE POLICY divergencias_update ON public.divergencias
  FOR UPDATE TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());
