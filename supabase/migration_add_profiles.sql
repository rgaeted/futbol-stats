-- ─── PROFILES TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read profiles (needed so the app can fetch its own role)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Only the service role (Supabase dashboard) can change roles — no app-level UPDATE policy

-- ─── BACKFILL: existing users get 'player' role ───────────────────────────────
INSERT INTO public.profiles (id, role)
SELECT id, 'player' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ─── TRIGGER: auto-create profile on signup ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'player')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── HELPER FUNCTION ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── UPDATE PLAYERS RLS ───────────────────────────────────────────────────────
-- Drop old user-level write policies (keep the SELECT policy)
DROP POLICY IF EXISTS "users_insert_own"       ON public.players;
DROP POLICY IF EXISTS "users_update_own"       ON public.players;
DROP POLICY IF EXISTS "users_delete_own"       ON public.players;
DROP POLICY IF EXISTS "admin_or_owner_insert"  ON public.players;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.players;
DROP POLICY IF EXISTS "Users can update own players"   ON public.players;
DROP POLICY IF EXISTS "Users can delete own players"   ON public.players;

-- Only admins can write players
CREATE POLICY "admin_insert" ON public.players
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update" ON public.players
  FOR UPDATE TO authenticated USING (is_admin());

CREATE POLICY "admin_delete" ON public.players
  FOR DELETE TO authenticated USING (is_admin());
