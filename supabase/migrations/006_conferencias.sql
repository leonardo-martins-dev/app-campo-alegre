-- Campo Alegre — 006: conferências e divergências

CREATE TABLE public.conferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo public.entidade_tipo NOT NULL,
  entidade_id uuid NOT NULL,
  conferido_por uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  status public.status_conferencia NOT NULL,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.divergencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conferencia_id uuid NOT NULL REFERENCES public.conferencias (id) ON DELETE CASCADE,
  motivo text NOT NULL,
  resolvida boolean NOT NULL DEFAULT false,
  resolvida_em timestamptz,
  resolvida_por uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conferencias_entidade ON public.conferencias (entidade_tipo, entidade_id);
CREATE INDEX idx_conferencias_conferido_por ON public.conferencias (conferido_por);
CREATE INDEX idx_divergencias_conferencia ON public.divergencias (conferencia_id);
CREATE INDEX idx_divergencias_resolvida ON public.divergencias (resolvida);
