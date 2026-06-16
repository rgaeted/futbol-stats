import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [role,        setRole]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchRole = async (userId) => {
    if (!userId) { setRole(null); return; }

    // Intento 1: RPC que crea el perfil si no existe (SECURITY DEFINER)
    const { data: rpcData, error: rpcError } = await supabase.rpc("ensure_own_profile");
    if (!rpcError) {
      setRole(rpcData ?? "player");
      return;
    }

    // Intento 2: leer directo desde la tabla (si la función aún no fue creada en Supabase)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    setRole(profile?.role ?? "player");
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      await fetchRole(u?.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchRole(u?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, role, isAdmin: role === "admin", authLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
