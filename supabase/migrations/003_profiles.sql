-- Campo Alegre — 003: profiles

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL,
  nivel_acesso public.nivel_acesso NOT NULL DEFAULT 'colaborador',
  loja_id uuid REFERENCES public.lojas (id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_nivel ON public.profiles (nivel_acesso);
CREATE INDEX idx_profiles_loja ON public.profiles (loja_id);
CREATE INDEX idx_profiles_email ON public.profiles (email);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
