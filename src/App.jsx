import { useState, useEffect } from "react";
import { db } from "./utils/db";
import Dashboard from "./components/Dashboard";
import PlayerForm from "./components/PlayerForm";
import EvaluationGuide from "./components/EvaluationGuide";
import PrintView from "./components/PrintView";
import PlayerDetail from "./components/PlayerDetail";
import ConfirmModal from "./components/ConfirmModal";

export default function App() {
  const [page,           setPage]           = useState("dashboard");
  const [players,        setPlayers]        = useState([]);
  const [editPlayer,     setEditPlayer]     = useState(null);
  const [detailPlayer,   setDetailPlayer]   = useState(null);
  const [printPlayers,   setPrintPlayers]   = useState(null);
  const [confirmDeleteId,setConfirmDeleteId]= useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    db.getAll()
      .then(setPlayers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const reload = async () => {
    try {
      setPlayers(await db.getAll());
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSave = async (data) => {
    if (editPlayer) await db.update(editPlayer.id, data);
    else await db.add(data);
    await reload();
    setPage("dashboard");
    setEditPlayer(null);
  };

  const handleConfirmDelete = async () => {
    await db.delete(confirmDeleteId);
    await reload();
    setDetailPlayer(null);
    setConfirmDeleteId(null);
  };

  const isForm = page === "form" || editPlayer;

  return (
    <div style={{minHeight:"100vh",background:"#070714",color:"#fff",fontFamily:"'Rajdhani',sans-serif"}}>
      <header className="app-header" style={{background:"#0d0d1a",borderBottom:"1px solid #1a1a2e",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",position:"sticky",top:0,zIndex:50,gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",flexShrink:0}}>
          <div style={{width:"36px",height:"36px",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>⚽</div>
          <div>
            <div style={{fontSize:"18px",fontWeight:900,letterSpacing:"0.12em",fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>CARD CENTER</div>
            <div style={{fontSize:"10px",color:"#555",letterSpacing:"0.15em"}}>SISTEMA DE EVALUACIÓN FIFA</div>
          </div>
        </div>

        <nav style={{display:"flex",gap:"4px"}}>
          {[["dashboard","⚽ Jugadores"],["guide","📋 Protocolo"]].map(([id, label]) => (
            <button key={id} onClick={() => { setPage(id); setEditPlayer(null); }} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:page===id&&!isForm?"#6c63ff22":"transparent",color:page===id&&!isForm?"#6c63ff":"#666",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",letterSpacing:"0.06em",borderBottom:page===id&&!isForm?"2px solid #6c63ff":"2px solid transparent",transition:"all 0.2s",whiteSpace:"nowrap"}}>{label}</button>
          ))}
        </nav>

        <div style={{flexShrink:0}}>
          {isForm && (
            <button onClick={() => { setPage("dashboard"); setEditPlayer(null); }} style={{padding:"8px 18px",borderRadius:"8px",border:"1px solid #333",background:"transparent",color:"#aaa",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px"}}>← Volver</button>
          )}
        </div>
      </header>

      <main className="app-main" style={{padding:"32px",maxWidth:"1400px",margin:"0 auto"}}>
        {error && (
          <div style={{background:"#ff4d4d22",border:"1px solid #ff4d4d55",borderRadius:"12px",padding:"16px 20px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"20px"}}>⚠️</span>
            <div>
              <div style={{color:"#ff4d4d",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"14px"}}>Error de conexión con Supabase</div>
              <div style={{color:"#ff9999",fontFamily:"'Rajdhani',sans-serif",fontSize:"12px",marginTop:"2px"}}>{error}</div>
            </div>
            <button onClick={() => setError(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#ff4d4d",cursor:"pointer",fontSize:"18px",padding:"4px"}}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:"100px 0"}}>
            <div style={{fontSize:"56px",marginBottom:"16px",animation:"fadeIn 0.5s ease"}}>⚽</div>
            <div style={{color:"#555",fontFamily:"'Bebas Neue',sans-serif",fontSize:"20px",letterSpacing:"0.3em"}}>CARGANDO...</div>
          </div>
        ) : (
          <>
            {page === "dashboard" && !isForm && (
              <Dashboard
                players={players}
                onNew={() => { setEditPlayer(null); setPage("form"); }}
                onPrintAll={() => setPrintPlayers(players)}
                setDetailPlayer={setDetailPlayer}
              />
            )}
            {isForm && (
              <div style={{animation:"fadeIn 0.3s ease"}}>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"32px",letterSpacing:"0.2em",marginBottom:"32px"}}>{editPlayer ? "✏️ EDITAR JUGADOR" : "➕ NUEVO JUGADOR"}</h1>
                <PlayerForm
                  initial={editPlayer}
                  onSave={handleSave}
                  onCancel={() => { setPage("dashboard"); setEditPlayer(null); }}
                />
              </div>
            )}
            {page === "guide" && !isForm && (
              <div style={{animation:"fadeIn 0.3s ease"}}>
                <EvaluationGuide />
              </div>
            )}
          </>
        )}
      </main>

      {printPlayers && <PrintView players={printPlayers} onClose={() => setPrintPlayers(null)} />}

      {detailPlayer && (
        <PlayerDetail
          player={detailPlayer}
          onClose={() => setDetailPlayer(null)}
          onEdit={() => { setEditPlayer(detailPlayer); setDetailPlayer(null); setPage("form"); }}
          onDelete={() => setConfirmDeleteId(detailPlayer.id)}
          onPrint={() => { setPrintPlayers([detailPlayer]); setDetailPlayer(null); }}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          message="¿Eliminar este jugador? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
