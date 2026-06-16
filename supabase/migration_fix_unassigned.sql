-- Reescribe get_unassigned_players para que parta de auth.users
-- y NO dependa de que exista la fila en profiles.
-- Solo excluye: admins explícitos + usuarios que ya tienen carta.
CREATE OR REPLACE FUNCTION public.get_unassigned_players()
RETURNS TABLE(id uuid, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::text
  FROM auth.users u
  WHERE
    -- Excluir admins (quienes tienen perfil con role = 'admin')
    NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = u.id AND p.role = 'admin'
    )
    -- Excluir usuarios que ya tienen carta creada
    AND NOT EXISTS (
      SELECT 1 FROM public.players pl
      WHERE pl.user_id = u.id
    )
  ORDER BY u.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
