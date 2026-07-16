-- Campo Alegre — 005: procedimentos, itens e fotos

CREATE TABLE public.procedimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_procedimento NOT NULL,
  loja_id uuid NOT NULL REFERENCES public.lojas (id) ON DELETE RESTRICT,
  usuario_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  status public.status_procedimento NOT NULL DEFAULT 'rascunho',
  enviado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.procedimento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedimento_id uuid NOT NULL REFERENCES public.procedimentos (id) ON DELETE CASCADE,
  item_id text NOT NULL,
  label text NOT NULL,
  concluido boolean NOT NULL DEFAULT false,
  requires_photo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (procedimento_id, item_id)
);

CREATE TABLE public.procedimento_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedimento_id uuid NOT NULL REFERENCES public.procedimentos (id) ON DELETE CASCADE,
  item_id text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_procedimentos_loja ON public.procedimentos (loja_id);
CREATE INDEX idx_procedimentos_usuario ON public.procedimentos (usuario_id);
CREATE INDEX idx_procedimentos_status ON public.procedimentos (status);
CREATE INDEX idx_procedimentos_tipo ON public.procedimentos (tipo);
CREATE INDEX idx_procedimento_itens_proc ON public.procedimento_itens (procedimento_id);
CREATE INDEX idx_procedimento_fotos_proc ON public.procedimento_fotos (procedimento_id);

CREATE TRIGGER trg_procedimentos_updated_at
  BEFORE UPDATE ON public.procedimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
