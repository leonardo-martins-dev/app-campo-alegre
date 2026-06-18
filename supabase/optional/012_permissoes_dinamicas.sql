-- Campo Alegre — 012 (opcional): permissões dinâmicas do Hub

CREATE TABLE public.acoes (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  screen text NOT NULL,
  icon text NOT NULL DEFAULT 'Circle',
  color text NOT NULL DEFAULT '#0ea5e9',
  ativa boolean NOT NULL DEFAULT true
);

CREATE TABLE public.nivel_acoes (
  nivel_acesso public.nivel_acesso NOT NULL,
  acao_id text NOT NULL REFERENCES public.acoes (id) ON DELETE CASCADE,
  PRIMARY KEY (nivel_acesso, acao_id)
);

ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nivel_acoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY acoes_select ON public.acoes
  FOR SELECT TO authenticated
  USING (ativa = true OR private.is_admin());

CREATE POLICY acoes_admin ON public.acoes
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY nivel_acoes_select ON public.nivel_acoes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY nivel_acoes_admin ON public.nivel_acoes
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());
