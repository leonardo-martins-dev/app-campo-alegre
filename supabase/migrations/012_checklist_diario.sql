-- Campo Alegre — checklist diário do colaborador (métricas)

CREATE TABLE public.checklist_diario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  loja_id uuid REFERENCES public.lojas (id) ON DELETE SET NULL,
  data date NOT NULL DEFAULT (timezone('America/Sao_Paulo', now()))::date,
  canhotos boolean NOT NULL DEFAULT false,
  procedimento boolean NOT NULL DEFAULT false,
  quebra boolean NOT NULL DEFAULT false,
  registrado boolean NOT NULL DEFAULT false,
  registrado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, data)
);

CREATE INDEX idx_checklist_diario_data ON public.checklist_diario (data);
CREATE INDEX idx_checklist_diario_loja ON public.checklist_diario (loja_id);
CREATE INDEX idx_checklist_diario_registrado ON public.checklist_diario (registrado) WHERE registrado = true;

CREATE TRIGGER trg_checklist_diario_updated_at
  BEFORE UPDATE ON public.checklist_diario
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.checklist_diario ENABLE ROW LEVEL SECURITY;

-- Colaborador: lê e escreve o próprio checklist
CREATE POLICY checklist_diario_select_own
  ON public.checklist_diario FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR private.is_supervisor_or_above()
  );

CREATE POLICY checklist_diario_insert_own
  ON public.checklist_diario FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY checklist_diario_update_own
  ON public.checklist_diario FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());
