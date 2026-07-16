-- Campo Alegre — 015: storage 30MB + múltiplas fotos por canhoto

-- 30 MB = 31457280 bytes
UPDATE storage.buckets
SET file_size_limit = 31457280
WHERE id IN ('canhotos-fotos', 'procedimentos-fotos');

CREATE TABLE IF NOT EXISTS public.canhoto_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canhoto_id uuid NOT NULL REFERENCES public.canhotos (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  ordem smallint NOT NULL DEFAULT 0 CHECK (ordem >= 0 AND ordem < 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canhoto_id, ordem)
);

CREATE INDEX IF NOT EXISTS idx_canhoto_fotos_canhoto
  ON public.canhoto_fotos (canhoto_id);

-- Backfill da foto principal existente
INSERT INTO public.canhoto_fotos (canhoto_id, storage_path, ordem)
SELECT id, foto_path, 0
FROM public.canhotos
WHERE foto_path IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.canhoto_fotos cf WHERE cf.canhoto_id = canhotos.id
  );

ALTER TABLE public.canhoto_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY canhoto_fotos_select ON public.canhoto_fotos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.canhotos c
      WHERE c.id = canhoto_id
        AND (
          c.usuario_id = auth.uid()
          OR private.can_access_loja(c.loja_id)
          OR private.is_administracao_or_admin()
        )
    )
  );

CREATE POLICY canhoto_fotos_insert ON public.canhoto_fotos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.canhotos c
      WHERE c.id = canhoto_id
        AND c.usuario_id = auth.uid()
    )
  );

CREATE POLICY canhoto_fotos_delete ON public.canhoto_fotos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.canhotos c
      WHERE c.id = canhoto_id
        AND (
          c.usuario_id = auth.uid()
          OR private.is_administracao_or_admin()
        )
    )
  );
