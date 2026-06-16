-- Permite que un usuario autenticado cree su propio perfil
-- (respaldo si el trigger on_auth_user_created no está configurado o falla)
CREATE POLICY "profiles_self_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
