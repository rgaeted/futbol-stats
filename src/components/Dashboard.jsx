import { useState } from "react";
import FifaCard from "./FifaCard";
import { calcOverall, getCardType } from "../utils/helpers";

const GOLD_TYPES = new Set(["gold_rare", "gold_nonrare", "toty", "inform", "hero"]);

export default function Dashboard({ players, currentUserId, onNew, onPrintAll, setDetailPlayer }) {
  const [search, setSearch] = useState("");

  const filtered = players.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.position?.toLowerCase().includes(search.toLowerCase()) ||
    p.club?.toLowerCase().includes(search.toLowerCase())
  );

  const summary = {
    total:      players.length,
    avgOverall: players.length
      ? Math.round(players.reduce((a, p) => a + calcOverall(p.stats), 0) / players.length)
      : 0,
    gold:       players.filter(p => GOLD_TYPES.has(p.cardType || getCardType(calcOverall(p.stats)))).length,
    positions:  new Set(players.map(p => p.position)).size,
  };

  const statCards = [
    ["JUGADORES", summary.total,      "#6c63ff", "👥"],
    ["PROMEDIO",  summary.avgOverall, "#f5d769", "⭐"],
    ["CARTAS ORO",summary.gold,       "#d4a017", "🥇"],
    ["POSICIONES",summary.positions,  "#00d4ff", "📍"],
  ];

  return (
    <>
      <div className="stats-grid">
        {statCards.map(([label, val, color, icon]) => (
          <div key={label} style={{background:"#0d0d1a",border:`1px solid ${color}33`,borderRadius:"14px",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#555",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"6px"}}>{label}</div>
              <div style={{color,fontSize:"36px",fontWeight:900,fontFamily:"'Bebas Neue',sans-serif"}}>{val}</div>
            </div>
            <div style={{fontSize:"28px",opacity:0.5}}>{icon}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:"200px",position:"relative"}}>
          <span style={{position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",color:"#444",fontSize:"16px"}}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, posición o club..."
            style={{width:"100%",background:"#0d0d1a",border:"1px solid #222",borderRadius:"10px",padding:"12px 16px 12px 44px",color:"#fff",fontSize:"15px",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box"}}
          />
        </div>
        <button onClick={onPrintAll} disabled={!players.length} style={{padding:"12px 20px",borderRadius:"10px",border:"1px solid #333",background:"transparent",color:players.length?"#aaa":"#333",cursor:players.length?"pointer":"default",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",whiteSpace:"nowrap"}}>🖨️ IMPRIMIR TODAS</button>
        <button onClick={onNew} style={{padding:"12px 24px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",boxShadow:"0 2px 12px #6c63ff44",whiteSpace:"nowrap"}}>+ NUEVO JUGADOR</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"80px 0",color:"#333"}}>
          <div style={{fontSize:"64px",marginBottom:"16px"}}>⚽</div>
          <div style={{fontSize:"20px",fontWeight:700,color:"#444",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"0.2em"}}>{players.length === 0 ? "SIN JUGADORES AÚN" : "SIN RESULTADOS"}</div>
          <div style={{color:"#333",marginTop:"8px",fontSize:"14px",fontFamily:"'Rajdhani',sans-serif"}}>{players.length === 0 ? "Crea tu primer jugador con el botón de arriba" : "Prueba con otra búsqueda"}</div>
        </div>
      ) : (
        <div style={{display:"flex",flexWrap:"wrap",gap:"20px"}}>
          {filtered.map(p => <FifaCard key={p.id} player={p} size="small" currentUserId={currentUserId} onClick={() => setDetailPlayer(p)} />)}
        </div>
      )}
    </>
  );
}
