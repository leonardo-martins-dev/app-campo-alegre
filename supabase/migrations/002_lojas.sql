-- Campo Alegre — 002: lojas

CREATE TABLE public.lojas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text NOT NULL UNIQUE,
  regiao text NOT NULL DEFAULT '',
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lojas_ativa ON public.lojas (ativa);
CREATE INDEX idx_lojas_codigo ON public.lojas (codigo);

CREATE TRIGGER trg_lojas_updated_at
  BEFORE UPDATE ON public.lojas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
