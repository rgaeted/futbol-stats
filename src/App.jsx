import { useState, useEffect } from "react";
import { db } from "./utils/db";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import PlayerForm from "./components/PlayerForm";
import EvaluationGuide from "./components/EvaluationGuide";
import PrintView from "./components/PrintView";
import PlayerDetail from "./components/PlayerDetail";
import ConfirmModal from "./components/ConfirmModal";
import AuthModal from "./components/AuthModal";
import EvaluationForm from "./components/EvaluationForm";
import Ranking from "./components/Ranking";
import RegionRanking from "./components/RegionRanking";
import LandingPage from "./components/LandingPage";
import CookieBanner, { useCookieConsent } from "./components/CookieBanner";

export default function App() {
  const { user, role, isAdmin, authLoading, signOut } = useAuth();
  const currentUserId = user?.id ?? null;

  const [page,           setPage]           = useState("dashboard");
  const [players,        setPlayers]        = useState([]);
  const [profiles,       setProfiles]       = useState([]);
  const [editPlayer,     setEditPlayer]     = useState(null);
  const [detailPlayer,   setDetailPlayer]   = useState(null);
  const [printPlayers,   setPrintPlayers]   = useState(null);
  const [confirmDeleteId,setConfirmDeleteId]= useState(null);
  const [evalPlayer,     setEvalPlayer]     = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [showAuth,       setShowAuth]       = useState(false);
  const [cookieConsent,  setCookieConsent]  = useState(() => useCookieConsent());

  useEffect(() => {
    db.getAll()
      .then(setPlayers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const reloadUnassigned = () => {
    if (isAdmin) db.getUnassignedPlayers().then(setProfiles).catch(() => {});
  };

  useEffect(() => {
    reloadUnassigned();
  }, [isAdmin]);

  const reload = async () => {
    try { setPlayers(await db.getAll()); }
    catch (e) { setError(e.message); }
  };

  const handleSave = async (data) => {
    const userId = data.assignedUserId || currentUserId;
    if (editPlayer) await db.update(editPlayer.id, { ...data, userId });
    else            await db.add({ ...data, userId });
    await reload();
    reloadUnassigned();
    setPage("dashboard");
    setEditPlayer(null);
  };

  const handleSaveEvaluation = async (newStats, _notes) => {
    await db.update(evalPlayer.id, { ...evalPlayer, stats: newStats });
    await reload();
    setDetailPlayer(null);
    setEvalPlayer(null);
  };

  const handleConfirmDelete = async () => {
    await db.delete(confirmDeleteId);
    await reload();
    setDetailPlayer(null);
    setConfirmDeleteId(null);
  };

  const goNew = () => {
    if (!user)    { setShowAuth(true); return; }
    if (!isAdmin) return;
    setEditPlayer(null);
    setPage("form");
  };

  const isForm = (page === "form" || editPlayer) && isAdmin;

  // Si el rol cambió y el admin perdió acceso mientras estaba en el formulario, volver al dashboard
  if (!isAdmin && !authLoading && (page === "form" || editPlayer)) {
    setPage("dashboard");
    setEditPlayer(null);
  }

  return (
    <div style={{minHeight:"100vh",background:"#07070D",color:"#ECECF5",fontFamily:"'Space Grotesk',sans-serif",position:"relative"}}>

      {/* Grid background */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(#ffffff06 1px,transparent 1px),linear-gradient(90deg,#ffffff06 1px,transparent 1px)",backgroundSize:"44px 44px",maskImage:"radial-gradient(ellipse 100% 80% at 50% 0%,#000 30%,transparent 75%)"}} />

      <header className="app-header" style={{background:"#0F0F1A",borderBottom:"1px solid #ffffff12",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",position:"sticky",top:0,zIndex:50,gap:"16px"}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",flexShrink:0}}>
          <svg viewBox="0 0 120 120" width="38" height="38">
            <rect x="6" y="6" width="108" height="108" rx="26" fill="#0F0F1A" stroke="#00FF94" strokeWidth="3"/>
            <line x1="60" y1="30" x2="60" y2="58" stroke="#00FF94" strokeWidth="8" strokeLinecap="round"/>
            <path d="M40 40 A26 26 0 1 0 80 40" fill="none" stroke="#00FF94" strokeWidth="8" strokeLinecap="round"/>
            <text x="60" y="102" textAnchor="middle" fontFamily="Archivo" fontWeight="900" fontSize="14" fill="#00FF94" letterSpacing="1">CRACK</text>
          </svg>
          <div>
            <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.45em",paddingLeft:"0.3em",color:"#ECECF5",fontSize:"9px",lineHeight:1}}>MODO</div>
            <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,letterSpacing:"-0.02em",lineHeight:0.9,color:"#00FF94",fontSize:"22px",textTransform:"uppercase"}}>CRACK</div>
            <div style={{fontSize:"8px",color:"#5A5A6E",letterSpacing:"0.12em",fontFamily:"'Chakra Petch',sans-serif",marginTop:"2px"}}>DESBLOQUEA TU NIVEL.</div>
          </div>
        </div>

        <nav className="header-nav" style={{display:"flex",gap:"4px"}}>
          {[["dashboard","⚽ Jugadores"],["ranking","🏆 Ranking"],["regions","🗺️ Regiones"],["guide","📋 Protocolo"]].map(([id, label]) => (
            <button key={id} onClick={() => { setPage(id); setEditPlayer(null); }} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:page===id&&!isForm?"#00FF9415":"transparent",color:page===id&&!isForm?"#00FF94":"#5A5A6E",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",letterSpacing:"0.04em",borderBottom:page===id&&!isForm?"2px solid #00FF94":"2px solid transparent",transition:"all 0.2s",whiteSpace:"nowrap"}}>{label}</button>
          ))}
        </nav>

        <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
          {!authLoading && (
            user ? (
              <>
                {role && (
                  <span className="header-role-badge" style={{padding:"3px 10px",borderRadius:"12px",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.12em",background:isAdmin?"#00FF9415":"#00E5FF15",color:isAdmin?"#00FF94":"#00E5FF",border:`1px solid ${isAdmin?"#00FF9433":"#00E5FF33"}`,flexShrink:0}}>
                    {isAdmin ? "ADMIN" : "JUGADOR"}
                  </span>
                )}
                <span className="header-user-email" style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",maxWidth:"140px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</span>
                <button onClick={signOut} style={{padding:"6px 14px",borderRadius:"7px",border:"1px solid #ffffff12",background:"transparent",color:"#5A5A6E",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"12px"}}>SALIR</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",boxShadow:"0 2px 12px #00ff9433"}}>INICIAR SESIÓN</button>
            )
          )}
          {isForm && (
            <button onClick={() => { setPage("dashboard"); setEditPlayer(null); }} style={{padding:"8px 18px",borderRadius:"8px",border:"1px solid #ffffff12",background:"transparent",color:"#ECECF5",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px"}}>← Volver</button>
          )}
        </div>
      </header>

      <main className="app-main" style={{padding:"32px",maxWidth:"1400px",margin:"0 auto",position:"relative",zIndex:1}}>
        {error && (
          <div style={{background:"#ff4d4d22",border:"1px solid #ff4d4d55",borderRadius:"12px",padding:"16px 20px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"20px"}}>⚠️</span>
            <div>
              <div style={{color:"#ff4d4d",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px"}}>Error de conexión con Supabase</div>
              <div style={{color:"#ff9999",fontFamily:"'Space Grotesk',sans-serif",fontSize:"12px",marginTop:"2px"}}>{error}</div>
            </div>
            <button onClick={() => setError(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#ff4d4d",cursor:"pointer",fontSize:"18px",padding:"4px"}}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:"100px 0"}}>
            <div style={{fontSize:"56px",marginBottom:"16px",animation:"fadeIn 0.5s ease"}}>⚽</div>
            <div style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"14px",letterSpacing:"0.3em"}}>CARGANDO...</div>
          </div>
        ) : !authLoading && !user ? (
          <LandingPage onShowAuth={() => setShowAuth(true)} />
        ) : (
          <>
            {page === "dashboard" && !isForm && (
              <Dashboard
                players={players}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onNew={goNew}
                setDetailPlayer={setDetailPlayer}
              />
            )}
            {isForm && (
              <div style={{animation:"fadeIn 0.3s ease"}}>
                <h1 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"32px",letterSpacing:"-0.01em",marginBottom:"32px"}}>{editPlayer ? "✏️ EDITAR CRACK" : "➕ NUEVO CRACK"}</h1>
                <PlayerForm
                  initial={editPlayer}
                  currentUserId={currentUserId}
                  availableUsers={profiles}
                  onSave={handleSave}
                  onCancel={() => { setPage("dashboard"); setEditPlayer(null); }}
                />
              </div>
            )}
            {page === "ranking" && !isForm && (
              <Ranking
                players={players}
                currentUserId={currentUserId}
                onPlayerClick={setDetailPlayer}
              />
            )}
            {page === "regions" && !isForm && (
              <RegionRanking
                players={players}
                onPlayerClick={setDetailPlayer}
              />
            )}
            {page === "guide" && !isForm && (
              <div style={{animation:"fadeIn 0.3s ease"}}>
                <EvaluationGuide />
              </div>
            )}
          </>
        )}
      </main>

      {printPlayers && (
        <PrintView
          players={printPlayers}
          currentUserId={currentUserId}
          onClose={() => setPrintPlayers(null)}
        />
      )}

      {detailPlayer && (
        <PlayerDetail
          player={detailPlayer}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setDetailPlayer(null)}
          onEdit={isAdmin ? () => { setEditPlayer(detailPlayer); setDetailPlayer(null); setPage("form"); } : undefined}
          onDelete={isAdmin ? () => setConfirmDeleteId(detailPlayer.id) : undefined}
          onEvaluate={isAdmin ? () => { setEvalPlayer(detailPlayer); setDetailPlayer(null); } : undefined}
          onPrint={() => { setPrintPlayers([detailPlayer]); setDetailPlayer(null); }}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          message="¿Eliminar este crack? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {evalPlayer && isAdmin && (
        <EvaluationForm
          player={evalPlayer}
          onClose={() => setEvalPlayer(null)}
          onSave={handleSaveEvaluation}
        />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {!cookieConsent && (
        <CookieBanner onConsent={setCookieConsent} />
      )}

      {/* Bottom nav — solo visible en móvil via CSS */}
      <nav className="bottom-nav">
        {[
          ["dashboard","⚽","Jugadores"],
          ["ranking","🏆","Ranking"],
          ["regions","🗺️","Regiones"],
          ["guide","📋","Protocolo"],
        ].map(([id, icon, label]) => {
          const active = page === id && !isForm;
          return (
            <button
              key={id}
              className="bottom-nav-item"
              onClick={() => { setPage(id); setEditPlayer(null); }}
              style={{color: active ? "#00FF94" : "#5A5A6E", borderTop: active ? "2px solid #00FF94" : "2px solid transparent"}}
            >
              <span className="bottom-nav-icon">{icon}</span>
              <span className="bottom-nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
