-- ─── FUNCIÓN: crea el perfil del usuario si no existe, retorna su rol ─────────
-- Sin columna email para no depender de migraciones opcionales
CREATE OR REPLACE FUNCTION public.ensure_own_profile()
RETURNS text AS $$
DECLARE
  existing_role text;
BEGIN
  SELECT role INTO existing_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role)
    VALUES (auth.uid(), 'player')
    ON CONFLICT (id) DO NOTHING;
    RETURN 'player';
  END IF;

  RETURN existing_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── FUNCIÓN: jugadores sin carta para el admin ───────────────────────────────
-- Lee email desde auth.users directamente (no depende de columna email en profiles)
-- Excluye usuarios que ya tienen una carta en la tabla players
CREATE OR REPLACE FUNCTION public.get_unassigned_players()
RETURNS TABLE(id uuid, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, u.email::text
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.role = 'player'
    AND NOT EXISTS (
      SELECT 1 FROM public.players pl WHERE pl.user_id = p.id
    )
  ORDER BY u.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
