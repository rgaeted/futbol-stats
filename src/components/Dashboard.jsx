import { useState } from "react";
import FifaCard from "./FifaCard";
import { calcOverall, getCardType, getFlagEmoji } from "../utils/helpers";
import { AGE_CATEGORIES, getAgeCategory } from "../constants/ageCategories";
import { CARD_TYPES } from "../constants/cardTypes";

const GOLD_TYPES = new Set(["gold_rare", "gold_nonrare", "toty", "inform", "hero"]);
const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = [160, 200, 130];
const PODIUM_RANKS   = [2, 1, 3];

export default function Dashboard({ players, currentUserId, isAdmin, onNew, setDetailPlayer }) {
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const withCat = players.map(p => ({ ...p, cat: getAgeCategory(p.birthDate), overall: calcOverall(p.stats) }));

  const filtered = withCat
    .filter(p => filterCat === "all" || p.cat?.key === filterCat)
    .filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.position?.toLowerCase().includes(search.toLowerCase()) ||
      p.club?.toLowerCase().includes(search.toLowerCase())
    );

  const summary = {
    total:      players.length,
    avgOverall: players.length ? Math.round(players.reduce((a, p) => a + calcOverall(p.stats), 0) / players.length) : 0,
    gold:       players.filter(p => GOLD_TYPES.has(p.cardType || getCardType(calcOverall(p.stats)))).length,
    cats:       new Set(players.map(p => getAgeCategory(p.birthDate)?.key).filter(Boolean)).size,
  };

  const statCards = [
    ["JUGADORES",  summary.total,      "#00FF94", "👥"],
    ["PROMEDIO",   summary.avgOverall, "#00E5FF", "⭐"],
    ["CRACKS ORO", summary.gold,       "#f5d769", "🥇"],
    ["CATEGORÍAS", summary.cats,       "#FF2E97", "📍"],
  ];

  // Top 3 siempre del total (sin filtros)
  const top3All = [...withCat].sort((a, b) => b.overall - a.overall).slice(0, 3);
  const podiumOrder = top3All.length === 3 ? [top3All[1], top3All[0], top3All[2]] : top3All;

  return (
    <>
      {/* ── PODIO TOP 3 ── */}
      {top3All.length > 0 && (
        <div style={{marginBottom:"40px"}}>
          <div style={{marginBottom:"20px",textAlign:"center"}}>
            <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:700,letterSpacing:"0.25em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"6px"}}>TOP 3</div>
            <h2 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"clamp(22px,5vw,32px)",letterSpacing:"-0.02em",margin:0,color:"#ECECF5"}}>LOS MEJORES CRACKS</h2>
          </div>

          <div className="podium-wrap" style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:"16px"}}>
            {podiumOrder.map((player, i) => {
              const rank    = PODIUM_RANKS[i];
              const typeKey = player.cardType || getCardType(player.overall);
              const type    = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
              return (
                <div key={player.id} className="podium-item" onClick={() => setDetailPlayer(player)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flexShrink:0}}>
                  <div style={{marginBottom:"8px",fontSize:rank===1?"28px":"22px"}}>{MEDAL[rank-1]}</div>
                  <FifaCard player={player} currentUserId={currentUserId} size={rank===1?"medium":"small"} />
                  <div className="podium-bar" style={{marginTop:"12px",width:"100%",minWidth:rank===1?"120px":"100px",background:rank===1?"#00FF9415":"#0F0F1A",border:`1px solid ${rank===1?"#00FF94":"#ffffff12"}`,borderBottom:"none",borderRadius:"10px 10px 0 0",padding:"12px 8px",textAlign:"center",height:`${PODIUM_HEIGHTS[i]}px`,display:"flex",flexDirection:"column",justifyContent:"flex-start"}}>
                    <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:rank===1?"20px":"16px",color:"#ECECF5",lineHeight:1.2}}>
                      {player.name.split(" ")[0]}
                    </div>
                    <div style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"11px",fontWeight:600,marginTop:"4px"}}>
                      {player.position} · {getFlagEmoji(player.nationality)}
                    </div>
                    {player.cat && (
                      <div style={{marginTop:"4px",fontSize:"10px",color:player.cat.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600}}>
                        {player.cat.icon} {player.cat.label}
                      </div>
                    )}
                    <div style={{color:rank===1?"#00FF94":type.accent,fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"28px",marginTop:"auto"}}>
                      {player.overall}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STATS ── */}
      <div className="stats-grid" style={{marginBottom:"24px"}}>
        {statCards.map(([label, val, color, icon]) => (
          <div key={label} style={{background:"#0F0F1A",border:`1px solid ${color}22`,borderRadius:"14px",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"6px"}}>{label}</div>
              <div style={{color,fontSize:"36px",fontWeight:900,fontFamily:"'Archivo',sans-serif"}}>{val}</div>
            </div>
            <div style={{fontSize:"28px",opacity:0.4}}>{icon}</div>
          </div>
        ))}
      </div>

      {/* ── FILTRO POR DIVISIÓN ── */}
      <div style={{background:"#0F0F1A",border:"1px solid #ffffff0a",borderRadius:"14px",padding:"16px 18px",marginBottom:"16px"}}>
        <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:700,letterSpacing:"0.2em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"10px"}}>FILTRAR POR DIVISIÓN</div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          <button onClick={() => setFilterCat("all")} style={{display:"flex",alignItems:"center",gap:"5px",padding:"7px 16px",borderRadius:"20px",border:`1px solid ${filterCat==="all"?"#00FF94":"#ffffff12"}`,background:filterCat==="all"?"#00FF9415":"transparent",color:filterCat==="all"?"#00FF94":"#5A5A6E",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",transition:"all 0.15s"}}>
            <span>⚽</span><span>Todas</span><span style={{opacity:0.6}}>({withCat.length})</span>
          </button>
          {AGE_CATEGORIES.map(c => {
            const count = withCat.filter(p => p.cat?.key === c.key).length;
            if (count === 0) return null;
            const active = filterCat === c.key;
            return (
              <button key={c.key} onClick={() => setFilterCat(c.key)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"7px 14px",borderRadius:"20px",border:`1px solid ${active?c.color:"#ffffff12"}`,background:active?`${c.color}18`:"transparent",color:active?c.color:"#5A5A6E",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",transition:"all 0.15s",boxShadow:active?`0 0 10px ${c.color}22`:"none"}}>
                <span>{c.icon}</span><span>{c.label}</span><span style={{opacity:0.6}}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:"200px",position:"relative"}}>
          <span style={{position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",color:"#5A5A6E",fontSize:"16px"}}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, posición o club..."
            style={{width:"100%",background:"#0F0F1A",border:"1px solid #ffffff12",borderRadius:"10px",padding:"12px 16px 12px 44px",color:"#ECECF5",fontSize:"15px",fontFamily:"'Space Grotesk',sans-serif",outline:"none",boxSizing:"border-box"}}
          />
        </div>
        {isAdmin && (
          <button onClick={onNew} style={{padding:"12px 24px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",boxShadow:"0 2px 12px #00ff9433",whiteSpace:"nowrap"}}>+ NUEVO CRACK</button>
        )}
      </div>

      {/* ── TODAS LAS CARTAS ── */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 0",color:"#5A5A6E"}}>
          <div style={{fontSize:"64px",marginBottom:"16px"}}>⚽</div>
          <div style={{fontSize:"20px",fontWeight:900,color:"#ECECF5",fontFamily:"'Archivo',sans-serif",letterSpacing:"-0.01em"}}>{players.length === 0 ? "TODAVÍA NO HAY CRACKS" : "SIN RESULTADOS"}</div>
          <div style={{color:"#5A5A6E",marginTop:"8px",fontSize:"14px",fontFamily:"'Space Grotesk',sans-serif"}}>{players.length === 0 ? "Activa tu primer crack con el botón de arriba" : "Prueba con otra búsqueda o categoría"}</div>
        </div>
      ) : (
        <>
          <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:700,letterSpacing:"0.2em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"16px"}}>
            TODOS LOS CRACKS — {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"20px"}}>
            {filtered.map(p => <FifaCard key={p.id} player={p} size="small" currentUserId={currentUserId} onClick={() => setDetailPlayer(p)} />)}
          </div>
        </>
      )}
    </>
  );
}
