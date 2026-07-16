-- Campo Alegre — 014: chaves de sync com jotter-logix

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS jotter_usuario_id integer;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_jotter_usuario_id
  ON public.profiles (jotter_usuario_id)
  WHERE jotter_usuario_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.jotter_usuario_id IS 'ID do usuario no Postgres do jotter-logix (fonte da verdade)';
COMMENT ON COLUMN public.lojas.codigo IS 'Chave externa; sync jotter usa codigo = jotter:{supermercado.id}';
