-- Campo Alegre — 004: canhotos e canhotos_sistema

CREATE TABLE public.canhotos_sistema (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL,
  data date NOT NULL,
  nfe text,
  total numeric(12, 2),
  nome_fantasia text,
  loja_id uuid REFERENCES public.lojas (id) ON DELETE SET NULL,
  status public.status_canhoto_sistema NOT NULL DEFAULT 'disponivel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (numero, loja_id)
);

CREATE TABLE public.canhotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL,
  loja_id uuid NOT NULL REFERENCES public.lojas (id) ON DELETE RESTRICT,
  usuario_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  foto_path text,
  status public.status_canhoto NOT NULL DEFAULT 'pendente',
  observacoes text,
  enviado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_canhotos_loja ON public.canhotos (loja_id);
CREATE INDEX idx_canhotos_usuario ON public.canhotos (usuario_id);
CREATE INDEX idx_canhotos_status ON public.canhotos (status);
CREATE INDEX idx_canhotos_numero ON public.canhotos (numero);
CREATE INDEX idx_canhotos_sistema_loja ON public.canhotos_sistema (loja_id);
CREATE INDEX idx_canhotos_sistema_status ON public.canhotos_sistema (status);
CREATE INDEX idx_canhotos_sistema_numero ON public.canhotos_sistema (numero);

CREATE TRIGGER trg_canhotos_updated_at
  BEFORE UPDATE ON public.canhotos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_canhotos_sistema_updated_at
  BEFORE UPDATE ON public.canhotos_sistema
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
