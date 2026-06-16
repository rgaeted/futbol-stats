import { useState } from "react";
import { supabase } from "../utils/supabase";

const inp = { width:"100%", background:"#161626", border:"1px solid #ffffff12", borderRadius:"8px", padding:"10px 14px", color:"#ECECF5", fontSize:"14px", fontFamily:"'Space Grotesk',sans-serif", boxSizing:"border-box", outline:"none" };
const lbl = { color:"#5A5A6E", fontSize:"11px", fontWeight:600, letterSpacing:"0.12em", marginBottom:"6px", display:"block", fontFamily:"'Chakra Petch',sans-serif" };

export default function AuthModal({ onClose }) {
  const [tab,      setTab]      = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);

  const switchTab = (id) => { setTab(id); setError(null); setSuccess(null); setConfirm(""); };

  const confirmOk  = confirm === password && confirm.length > 0;
  const confirmErr = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (tab === "signup" && password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        // Si el proyecto no requiere confirmación de email, el usuario queda con sesión
        // activa de inmediato y podemos crear su perfil ahora.
        if (data.user && data.session) {
          await supabase.from("profiles").upsert(
            { id: data.user.id, role: "player", email },
            { onConflict: "id" }
          );
          onClose();
        } else {
          setSuccess("Revisa tu email para confirmar tu cuenta. Una vez confirmada podrás iniciar sesión.");
        }
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
      <div onClick={e => e.stopPropagation()} style={{background:"#0F0F1A",border:"1px solid #ffffff12",borderRadius:"20px",padding:"32px",maxWidth:"400px",width:"100%",boxShadow:"0 0 60px #00000099"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <svg viewBox="0 0 120 120" width="48" height="48" style={{margin:"0 auto 12px",display:"block"}}>
            <rect x="6" y="6" width="108" height="108" rx="26" fill="#0F0F1A" stroke="#00FF94" strokeWidth="3"/>
            <line x1="60" y1="30" x2="60" y2="58" stroke="#00FF94" strokeWidth="8" strokeLinecap="round"/>
            <path d="M40 40 A26 26 0 1 0 80 40" fill="none" stroke="#00FF94" strokeWidth="8" strokeLinecap="round"/>
          </svg>
          <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.45em",paddingLeft:"0.45em",color:"#ECECF5",fontSize:"11px",lineHeight:1}}>MODO</div>
          <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,letterSpacing:"-0.02em",color:"#00FF94",fontSize:"28px",textTransform:"uppercase",lineHeight:0.9,marginBottom:"8px"}}>CRACK</div>
          <p style={{margin:0,color:"#5A5A6E",fontSize:"12px",fontFamily:"'Chakra Petch',sans-serif",letterSpacing:"0.1em"}}>ACCEDÉ PARA GESTIONAR TUS CRACKS</p>
        </div>

        <div style={{display:"flex",gap:"4px",marginBottom:"24px",background:"#161626",padding:"4px",borderRadius:"10px"}}>
          {[["login","INICIAR SESIÓN"],["signup","REGISTRARSE"]].map(([id, label]) => (
            <button key={id} onClick={() => switchTab(id)} style={{flex:1,padding:"10px",borderRadius:"7px",border:"none",cursor:"pointer",background:tab===id?"#00FF94":"transparent",color:tab===id?"#07070D":"#5A5A6E",fontWeight:700,fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"0.04em",transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>

        {success ? (
          <div style={{textAlign:"center",padding:"24px 0",color:"#00FF94",fontFamily:"'Space Grotesk',sans-serif",fontSize:"15px",lineHeight:1.6}}>
            ✅ {success}
            <br />
            <button onClick={onClose} style={{marginTop:"16px",padding:"10px 24px",borderRadius:"8px",border:"1px solid #ffffff12",background:"transparent",color:"#5A5A6E",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>CERRAR</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:"16px"}}>
              <label style={lbl}>EMAIL</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inp} />
            </div>
            <div style={{marginBottom: tab === "signup" ? "16px" : "24px"}}>
              <label style={lbl}>CONTRASEÑA</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} />
            </div>
            {tab === "signup" && (
              <div style={{marginBottom:"24px"}}>
                <label style={lbl}>CONFIRMAR CONTRASEÑA</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repetí tu contraseña"
                  style={{...inp, borderColor: confirmErr ? "#ff4d4d" : confirmOk ? "#00FF94" : "#ffffff12"}}
                />
                {confirmErr && <p style={{color:"#ff6b6b",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"4px"}}>⚠ Las contraseñas no coinciden</p>}
                {confirmOk  && <p style={{color:"#00FF94",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"4px"}}>✓ Las contraseñas coinciden</p>}
              </div>
            )}
            {error && (
              <p style={{color:"#ff6b6b",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",marginBottom:"16px",textAlign:"center",background:"#ff4d4d11",padding:"10px",borderRadius:"8px",border:"1px solid #ff4d4d33"}}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || (tab === "signup" && confirmErr)}
              style={{width:"100%",padding:"14px",borderRadius:"10px",border:"none",background:(loading||(tab==="signup"&&confirmErr))?"#161626":"linear-gradient(135deg,#00FF94,#00C972)",color:(loading||(tab==="signup"&&confirmErr))?"#5A5A6E":"#07070D",cursor:(loading||(tab==="signup"&&confirmErr))?"not-allowed":"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:"16px",letterSpacing:"0.04em",boxShadow:(loading||(tab==="signup"&&confirmErr))?"none":"0 4px 20px #00ff9433",transition:"all 0.2s"}}
            >
              {loading ? "CARGANDO..." : tab === "login" ? "ENTRAR" : "CREAR CUENTA"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
