-- Campo Alegre — 011 (opcional): Importador Linker

CREATE TABLE public.importacoes_pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_arquivo text NOT NULL,
  usuario_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'processando',
  total_itens int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vinculos_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  importacao_id uuid NOT NULL REFERENCES public.importacoes_pedidos (id) ON DELETE CASCADE,
  nro_empresa text,
  seq_produto text NOT NULL,
  desc_completa text,
  qtd_solicitada numeric(12, 2),
  cod_produto text,
  cod_super text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_importacoes_usuario ON public.importacoes_pedidos (usuario_id);
CREATE INDEX idx_vinculos_importacao ON public.vinculos_produtos (importacao_id);

ALTER TABLE public.importacoes_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinculos_produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY importacoes_select ON public.importacoes_pedidos
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR private.is_administracao_or_admin()
  );

CREATE POLICY importacoes_write ON public.importacoes_pedidos
  FOR ALL TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());

CREATE POLICY vinculos_select ON public.vinculos_produtos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.importacoes_pedidos i
      WHERE i.id = importacao_id
        AND (i.usuario_id = auth.uid() OR private.is_administracao_or_admin())
    )
  );

CREATE POLICY vinculos_write ON public.vinculos_produtos
  FOR ALL TO authenticated
  USING (private.is_administracao_or_admin())
  WITH CHECK (private.is_administracao_or_admin());
