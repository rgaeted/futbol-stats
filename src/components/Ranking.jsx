import { useState } from "react";
import FifaCard from "./FifaCard";
import { CARD_TYPES } from "../constants/cardTypes";
import { AGE_CATEGORIES, getAgeCategory } from "../constants/ageCategories";
import { calcOverall, getCardType, getFlagEmoji } from "../utils/helpers";
import { POSITION_LABELS } from "../constants/lists";

const MEDAL = ["🥇", "🥈", "🥉"];
const POS_OPTS = ["Todos", "ST", "CM", "CB", "GK", "LW", "RW", "CAM", "CDM", "LB", "RB"];

export default function Ranking({ players, currentUserId, onPlayerClick }) {
  const [posFilter, setPosFilter] = useState("Todos");
  const [catFilter, setCatFilter] = useState("all");
  const [preview,   setPreview]   = useState(null);

  const enriched = players.map(p => ({ ...p, overall: calcOverall(p.stats), cat: getAgeCategory(p.birthDate) }));

  const ranked = enriched
    .filter(p => posFilter === "Todos" || p.position === posFilter)
    .filter(p => catFilter === "all" || p.cat?.key === catFilter)
    .sort((a, b) => b.overall - a.overall);

  const top3          = ranked.slice(0, 3);
  const rest          = ranked.slice(3);
  const podiumOrder   = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = [160, 200, 130];
  const podiumRanks   = [2, 1, 3];

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>

      {/* ── PODIO (cartas) ── */}
      {ranked.length === 0 ? (
        <div style={{textAlign:"center",padding:"80px 0"}}>
          <div style={{fontSize:"64px",marginBottom:"16px"}}>🏆</div>
          <div style={{fontSize:"20px",fontWeight:900,color:"#ECECF5",fontFamily:"'Archivo',sans-serif",letterSpacing:"-0.01em"}}>TODAVÍA NO HAY CRACKS</div>
          <div style={{color:"#5A5A6E",marginTop:"8px",fontSize:"14px",fontFamily:"'Space Grotesk',sans-serif"}}>Activa jugadores desde la sección Jugadores</div>
        </div>
      ) : (
        <>
          {top3.length === 3 && (
            <div className="podium-wrap" style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:"16px",marginBottom:"48px"}}>
              {podiumOrder.map((player, i) => {
                const rank    = podiumRanks[i];
                const typeKey = player.cardType || getCardType(player.overall);
                const type    = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
                return (
                  <div key={player.id} className="podium-item" onClick={() => onPlayerClick(player)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flexShrink:0}}>
                    <div style={{marginBottom:"8px",fontSize:rank===1?"28px":"22px"}}>{MEDAL[rank-1]}</div>
                    <FifaCard player={player} currentUserId={currentUserId} size={rank===1?"medium":"small"} />
                    <div className="podium-bar" style={{marginTop:"12px",width:"100%",minWidth:rank===1?"120px":"100px",background:rank===1?"#00FF9415":"#0F0F1A",border:`1px solid ${rank===1?"#00FF94":"#ffffff12"}`,borderBottom:"none",borderRadius:"10px 10px 0 0",padding:"12px 8px",textAlign:"center",height:`${podiumHeights[i]}px`,display:"flex",flexDirection:"column",justifyContent:"flex-start"}}>
                      <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:rank===1?"20px":"16px",color:"#ECECF5",letterSpacing:"0.02em",lineHeight:1.2}}>
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
          )}

          {/* ── TÍTULO ── */}
          <div style={{marginBottom:"20px"}}>
            <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.3em",fontSize:"11px",color:"#00FF94",marginBottom:"6px"}}>MODO CRACK</div>
            <h1 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"36px",letterSpacing:"-0.01em",margin:"0 0 4px",color:"#ECECF5"}}>TABLA DE CRACKS</h1>
            <p style={{color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",margin:0}}>
              Clasificación por overall — {ranked.length} jugador{ranked.length !== 1 ? "es" : ""}
            </p>
          </div>

          {/* ── FILTROS ── */}
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"12px"}}>
            <button onClick={() => setCatFilter("all")} style={{padding:"5px 14px",borderRadius:"20px",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",transition:"all 0.15s",background:catFilter==="all"?"#00FF94":"#0F0F1A",color:catFilter==="all"?"#07070D":"#5A5A6E",border:`1px solid ${catFilter==="all"?"#00FF94":"#ffffff12"}`}}>Todas</button>
            {AGE_CATEGORIES.map(c => {
              const count = enriched.filter(p => p.cat?.key === c.key).length;
              if (count === 0) return null;
              return (
                <button key={c.key} onClick={() => setCatFilter(c.key)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",transition:"all 0.15s",background:catFilter===c.key?`${c.color}22`:"#0F0F1A",color:catFilter===c.key?c.color:"#5A5A6E",border:`1px solid ${catFilter===c.key?c.color:"#ffffff12"}`}}>
                  <span>{c.icon}</span><span>{c.label}</span><span style={{opacity:0.6}}>({count})</span>
                </button>
              );
            })}
          </div>

          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"28px"}}>
            {POS_OPTS.map(pos => (
              <button key={pos} onClick={() => setPosFilter(pos)} style={{padding:"5px 14px",borderRadius:"20px",cursor:"pointer",background:posFilter===pos?"#00FF94":"#0F0F1A",color:posFilter===pos?"#07070D":"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",border:`1px solid ${posFilter===pos?"#00FF94":"#ffffff12"}`,transition:"all 0.15s"}}>
                {pos}{POSITION_LABELS[pos] ? ` · ${POSITION_LABELS[pos]}` : ""}
              </button>
            ))}
          </div>

          {/* ── TABLA ── */}
          <div style={{background:"#0F0F1A",border:"1px solid #ffffff12",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"56px 1fr auto auto auto auto",gap:"0",padding:"12px 20px",background:"#161626",borderBottom:"1px solid #ffffff12"}}>
              {["#","JUGADOR","CAT","POS","CLUB","OVR"].map(h => (
                <div key={h} style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"10px",fontWeight:600,letterSpacing:"0.15em",textAlign:h==="OVR"?"right":"left"}}>{h}</div>
              ))}
            </div>

            {(top3.length < 2 ? ranked : [...top3, ...rest]).map((player, i) => {
              const typeKey = player.cardType || getCardType(player.overall);
              const type    = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
              const rank    = i + 1;
              return (
                <div
                  key={player.id}
                  onClick={() => onPlayerClick(player)}
                  onMouseEnter={() => setPreview(player.id)}
                  onMouseLeave={() => setPreview(null)}
                  style={{display:"grid",gridTemplateColumns:"56px 1fr auto auto auto auto",gap:"0",padding:"14px 20px",borderBottom:"1px solid #0F0F1A",cursor:"pointer",transition:"background 0.15s",background:preview===player.id?"#161626":"transparent",alignItems:"center"}}
                >
                  <div style={{display:"flex",alignItems:"center"}}>
                    {rank <= 3
                      ? <span style={{fontSize:"18px"}}>{MEDAL[rank-1]}</span>
                      : <span style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"15px",width:"24px",textAlign:"center"}}>{rank}</span>
                    }
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:type.accent,flexShrink:0}}/>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"15px",color:"#ECECF5"}}>{player.name}</span>
                    <span style={{color:"#5A5A6E",fontSize:"14px"}}>{getFlagEmoji(player.nationality)}</span>
                  </div>
                  <div style={{paddingRight:"16px"}}>
                    {player.cat
                      ? <span style={{fontSize:"11px",color:player.cat.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,padding:"2px 8px",borderRadius:"10px",background:`${player.cat.color}18`,border:`1px solid ${player.cat.color}33`}}>{player.cat.icon} {player.cat.label}</span>
                      : <span style={{color:"#5A5A6E",fontSize:"11px"}}>—</span>
                    }
                  </div>
                  <div style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",paddingRight:"16px"}}>{player.position}</div>
                  <div style={{color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",paddingRight:"20px",maxWidth:"120px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{player.club}</div>
                  <div style={{color:rank===1?"#00FF94":type.accent,fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"24px",textAlign:"right"}}>{player.overall}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
