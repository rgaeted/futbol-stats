-- ─── STORAGE: bucket player-photos ───────────────────────────────────────────
-- PASO 1: Crear el bucket desde el Dashboard de Supabase
--   Storage → New bucket → Name: "player-photos" → Public: ON → Create
--
-- PASO 2: Ejecutar este SQL para agregar las políticas de escritura

-- Cualquier persona puede leer las fotos (el bucket ya es público, pero por claridad)
CREATE POLICY "photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'player-photos');

-- Solo admins pueden subir fotos
CREATE POLICY "photos_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'player-photos' AND is_admin());

-- Solo admins pueden actualizar fotos
CREATE POLICY "photos_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'player-photos' AND is_admin());

-- Solo admins pueden eliminar fotos
CREATE POLICY "photos_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'player-photos' AND is_admin());
