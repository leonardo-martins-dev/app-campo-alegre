-- Campo Alegre — 009: Storage buckets e policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'canhotos-fotos',
    'canhotos-fotos',
    false,
    31457280,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  ),
  (
    'procedimentos-fotos',
    'procedimentos-fotos',
    false,
    31457280,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  )
ON CONFLICT (id) DO NOTHING;

-- CANHOTOS FOTOS: upload pelo dono; leitura supervisor+ da loja
CREATE POLICY canhotos_fotos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'canhotos-fotos'
    AND (
      private.is_administracao_or_admin()
      OR (storage.foldername(name))[1]::uuid = private.get_user_loja_id()
      OR owner = auth.uid()
    )
  );

CREATE POLICY canhotos_fotos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'canhotos-fotos'
    AND owner = auth.uid()
  );

CREATE POLICY canhotos_fotos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'canhotos-fotos' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'canhotos-fotos' AND owner = auth.uid());

CREATE POLICY canhotos_fotos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'canhotos-fotos' AND owner = auth.uid());

-- PROCEDIMENTOS FOTOS
CREATE POLICY procedimentos_fotos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'procedimentos-fotos'
    AND (
      private.is_administracao_or_admin()
      OR owner = auth.uid()
      OR private.is_supervisor_or_above()
    )
  );

CREATE POLICY procedimentos_fotos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'procedimentos-fotos'
    AND owner = auth.uid()
  );

CREATE POLICY procedimentos_fotos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'procedimentos-fotos' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'procedimentos-fotos' AND owner = auth.uid());

CREATE POLICY procedimentos_fotos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'procedimentos-fotos' AND owner = auth.uid());
