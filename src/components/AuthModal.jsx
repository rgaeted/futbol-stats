import { useState } from "react";
import { supabase } from "../utils/supabase";

const inp = { width:"100%", background:"#111", border:"1px solid #333", borderRadius:"8px", padding:"10px 14px", color:"#fff", fontSize:"14px", fontFamily:"'Rajdhani',sans-serif", boxSizing:"border-box", outline:"none" };
const lbl = { color:"#888", fontSize:"11px", fontWeight:700, letterSpacing:"0.1em", marginBottom:"6px", display:"block", fontFamily:"'Rajdhani',sans-serif" };

export default function AuthModal({ onClose }) {
  const [tab,      setTab]      = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const switchTab = (id) => { setTab(id); setError(null); setSuccess(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Revisa tu email para confirmar tu cuenta.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:"20px",padding:"32px",maxWidth:"400px",width:"100%",boxShadow:"0 0 60px #00000099"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{width:"48px",height:"48px",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",margin:"0 auto 12px"}}>⚽</div>
          <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:"26px",letterSpacing:"0.2em",color:"#fff"}}>CARD CENTER</h2>
          <p style={{margin:"4px 0 0",color:"#444",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.1em"}}>ACCEDE PARA GESTIONAR TUS CARTAS</p>
        </div>

        <div style={{display:"flex",gap:"4px",marginBottom:"24px",background:"#111",padding:"4px",borderRadius:"10px"}}>
          {[["login","INICIAR SESIÓN"],["signup","REGISTRARSE"]].map(([id, label]) => (
            <button key={id} onClick={() => switchTab(id)} style={{flex:1,padding:"10px",borderRadius:"7px",border:"none",cursor:"pointer",background:tab===id?"#6c63ff":"transparent",color:tab===id?"#fff":"#555",fontWeight:700,fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em",transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>

        {success ? (
          <div style={{textAlign:"center",padding:"24px 0",color:"#00ff88",fontFamily:"'Rajdhani',sans-serif",fontSize:"15px",lineHeight:1.6}}>
            ✅ {success}
            <br />
            <button onClick={onClose} style={{marginTop:"16px",padding:"10px 24px",borderRadius:"8px",border:"1px solid #333",background:"transparent",color:"#888",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>CERRAR</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:"16px"}}>
              <label style={lbl}>EMAIL</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inp} />
            </div>
            <div style={{marginBottom:"24px"}}>
              <label style={lbl}>CONTRASEÑA</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} />
            </div>
            {error && (
              <p style={{color:"#ff6b6b",fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",marginBottom:"16px",textAlign:"center",background:"#ff4d4d11",padding:"10px",borderRadius:"8px",border:"1px solid #ff4d4d33"}}>{error}</p>
            )}
            <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",borderRadius:"10px",border:"none",background:loading?"#333":"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:loading?"wait":"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:"16px",letterSpacing:"0.1em",boxShadow:loading?"none":"0 4px 20px #6c63ff55",transition:"all 0.2s"}}>
              {loading ? "CARGANDO..." : tab === "login" ? "ENTRAR" : "CREAR CUENTA"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
