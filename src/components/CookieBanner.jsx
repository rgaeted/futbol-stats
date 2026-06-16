import { useState } from "react";

const STORAGE_KEY = "mc_cookie_consent";

export function useCookieConsent() {
  return localStorage.getItem(STORAGE_KEY);
}

export default function CookieBanner({ onConsent }) {
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const save = (choice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    onConsent(choice);
  };

  return (
    <div style={{
      position:"fixed", bottom: expanded ? 0 : "72px", left:0, right:0,
      zIndex:200, padding:"0 12px 12px",
      animation:"fadeIn 0.3s ease",
    }}>
      <div style={{
        maxWidth:"760px", margin:"0 auto",
        background:"#0F0F1A", border:"1px solid #ffffff18",
        borderRadius:"16px", padding:"20px 22px",
        boxShadow:"0 -4px 40px #00000066",
      }}>
        {!expanded ? (
          /* Vista compacta */
          <div style={{display:"flex",gap:"16px",alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:"200px"}}>
              <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:700,fontSize:"13px",color:"#ECECF5",marginBottom:"4px",letterSpacing:"0.05em"}}>
                🍪 Cookies y privacidad
              </div>
              <p style={{color:"#5A5A6E",fontSize:"12px",fontFamily:"'Space Grotesk',sans-serif",margin:0,lineHeight:1.5}}>
                Usamos cookies esenciales para que la sesión funcione y opcionales para mejorar tu experiencia.{" "}
                <button onClick={() => setExpanded(true)} style={{background:"none",border:"none",color:"#00FF94",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontSize:"12px",padding:0,textDecoration:"underline"}}>
                  Personalizar
                </button>
              </p>
            </div>
            <div style={{display:"flex",gap:"8px",flexShrink:0,flexWrap:"wrap"}}>
              <button
                onClick={() => save("essential")}
                style={{padding:"9px 16px",borderRadius:"8px",border:"1px solid #ffffff18",background:"transparent",color:"#9090A8",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"12px",whiteSpace:"nowrap"}}
              >Solo esenciales</button>
              <button
                onClick={() => save("all")}
                style={{padding:"9px 20px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"12px",whiteSpace:"nowrap",boxShadow:"0 2px 12px #00ff9422"}}
              >Aceptar todas</button>
            </div>
          </div>
        ) : (
          /* Vista expandida */
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:700,fontSize:"14px",color:"#ECECF5",letterSpacing:"0.05em"}}>🍪 Preferencias de cookies</div>
              <button onClick={() => setExpanded(false)} style={{background:"none",border:"none",color:"#5A5A6E",cursor:"pointer",fontSize:"18px",lineHeight:1,padding:"4px"}}>✕</button>
            </div>

            {/* Cookie esencial */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px",borderRadius:"10px",background:"#161626",border:"1px solid #ffffff0a",marginBottom:"8px"}}>
              <div style={{flex:1,marginRight:"16px"}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",color:"#ECECF5",marginBottom:"3px"}}>Cookies esenciales</div>
                <div style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.5}}>
                  Necesarias para que la sesión de usuario funcione. Incluyen el token de autenticación de Supabase. Sin estas cookies la app no puede funcionar.
                </div>
              </div>
              <div style={{padding:"4px 10px",borderRadius:"6px",background:"#00FF9415",border:"1px solid #00FF9433",color:"#00FF94",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,flexShrink:0}}>SIEMPRE ACTIVAS</div>
            </div>

            {/* Cookie analytics */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px",borderRadius:"10px",background:"#161626",border:`1px solid ${analytics?"#00FF9422":"#ffffff0a"}`,marginBottom:"16px"}}>
              <div style={{flex:1,marginRight:"16px"}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",color:"#ECECF5",marginBottom:"3px"}}>Cookies de rendimiento</div>
                <div style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.5}}>
                  Nos ayudan a entender cómo se usa la app para poder mejorarla. Los datos son anónimos y no se comparten con terceros.
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setAnalytics(v => !v)}
                style={{flexShrink:0,width:"44px",height:"24px",borderRadius:"12px",border:"none",cursor:"pointer",background:analytics?"#00FF94":"#2a2a3e",position:"relative",transition:"background 0.2s"}}
              >
                <div style={{position:"absolute",top:"3px",left:analytics?"23px":"3px",width:"18px",height:"18px",borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </button>
            </div>

            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",flexWrap:"wrap"}}>
              <button
                onClick={() => save("essential")}
                style={{padding:"9px 16px",borderRadius:"8px",border:"1px solid #ffffff18",background:"transparent",color:"#9090A8",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"12px"}}
              >Solo esenciales</button>
              <button
                onClick={() => save(analytics ? "all" : "essential")}
                style={{padding:"9px 20px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"12px",boxShadow:"0 2px 12px #00ff9422"}}
              >Guardar preferencias</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
