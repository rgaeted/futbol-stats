import { useState } from "react";
import FifaCard from "./FifaCard";
import { REGIONS_CHILE } from "../constants/regions";
import { CARD_TYPES, statLabels, statColors } from "../constants/cardTypes";
import { AGE_CATEGORIES, getAgeCategory } from "../constants/ageCategories";
import { calcOverall, getCardType, getFlagEmoji } from "../utils/helpers";

const MEDAL = ["🥇", "🥈", "🥉"];
const STAT_OPTS = [["overall", "⭐ OVR", "#00FF94"], ...Object.entries(statLabels).map(([k, v]) => [k, v, statColors[k]])];

export default function RegionRanking({ players, onPlayerClick }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedStat,   setSelectedStat]   = useState("overall");
  const [catFilter,      setCatFilter]      = useState("all");

  const enriched = players.map(p => ({
    ...p,
    overall: calcOverall(p.stats),
    cat: getAgeCategory(p.birthDate),
    regionData: REGIONS_CHILE.find(r => r.key === p.region) || null,
  }));

  const getStatVal = (p, stat) => stat === "overall" ? p.overall : (p.stats?.[stat] || 0);

  const catFiltered = catFilter === "all" ? enriched : enriched.filter(p => p.cat?.key === catFilter);

  // Build region stats
  const regionStats = REGIONS_CHILE.map(reg => {
    const rp = catFiltered.filter(p => p.region === reg.key);
    const avgOverall = rp.length
      ? Math.round(rp.reduce((a, p) => a + p.overall, 0) / rp.length)
      : 0;
    const top = [...rp].sort((a, b) => getStatVal(b, selectedStat) - getStatVal(a, selectedStat)).slice(0, 3);
    return { ...reg, count: rp.length, avgOverall, top, players: rp };
  })
    .filter(r => r.count > 0)
    .sort((a, b) => b.avgOverall - a.avgOverall);

  const unassigned = enriched.filter(p => !p.region).length;

  // Players in selected region
  const regionPlayers = selectedRegion
    ? catFiltered
        .filter(p => p.region === selectedRegion)
        .sort((a, b) => getStatVal(b, selectedStat) - getStatVal(a, selectedStat))
    : [];

  const activeRegionData = REGIONS_CHILE.find(r => r.key === selectedRegion);

  const topPlayers = [...catFiltered]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 6);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* ── CARTAS TOP ── */}
      {topPlayers.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:"16px",marginBottom:"40px"}}>
          {topPlayers.map(p => (
            <FifaCard key={p.id} player={p} size="small" onClick={() => onPlayerClick(p)} />
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.3em",fontSize:"11px",color:"#00FF94",marginBottom:"6px"}}>MODO CRACK</div>
        <h1 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"34px",letterSpacing:"-0.01em",margin:"0 0 4px",color:"#ECECF5"}}>
          RANKING POR REGIÓN
        </h1>
        <p style={{color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",margin:0}}>
          {players.length} jugadores · {regionStats.length} regiones con jugadores
          {unassigned > 0 && <span style={{color:"#5A5A6E"}}> · {unassigned} sin región</span>}
        </p>
      </div>

      {/* Category filter */}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"12px"}}>
        <button onClick={() => setCatFilter("all")} style={{padding:"5px 14px",borderRadius:"20px",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"11px",transition:"all 0.15s",background:catFilter==="all"?"#00FF9415":"#0F0F1A",color:catFilter==="all"?"#00FF94":"#5A5A6E",border:`1px solid ${catFilter==="all"?"#00FF94":"#ffffff12"}`}}>Todas</button>
        {AGE_CATEGORIES.map(c => {
          const count = enriched.filter(p => p.cat?.key === c.key).length;
          if (count === 0) return null;
          return (
            <button key={c.key} onClick={() => setCatFilter(c.key)} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"20px",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"11px",transition:"all 0.15s",background:catFilter===c.key?`${c.color}15`:"#0F0F1A",color:catFilter===c.key?c.color:"#5A5A6E",border:`1px solid ${catFilter===c.key?c.color:"#ffffff12"}`}}>
              <span>{c.icon}</span><span>{c.label}</span><span style={{opacity:0.6}}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Stat filter */}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"28px"}}>
        {STAT_OPTS.map(([key, label, color]) => (
          <button
            key={key}
            onClick={() => setSelectedStat(key)}
            style={{padding:"6px 14px",borderRadius:"20px",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",transition:"all 0.15s",
              background: selectedStat === key ? color : "#0F0F1A",
              color:       selectedStat === key ? "#07070D" : "#5A5A6E",
              border:      `1px solid ${selectedStat === key ? color : "#ffffff12"}`,
            }}
          >{label}</button>
        ))}
      </div>

      {players.length === 0 ? (
        <div style={{textAlign:"center",padding:"80px 0"}}>
          <div style={{fontSize:"64px",marginBottom:"16px"}}>🗺️</div>
          <div style={{fontSize:"20px",fontWeight:900,color:"#ECECF5",fontFamily:"'Archivo',sans-serif",letterSpacing:"-0.01em"}}>TODAVÍA NO HAY CRACKS</div>
          <div style={{color:"#5A5A6E",marginTop:"8px",fontSize:"14px",fontFamily:"'Space Grotesk',sans-serif"}}>Activa jugadores y asígnales su región para ver este ranking</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",alignItems:"start"}}>

          {/* LEFT: Region list */}
          <div>
            <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:600,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>REGIONES — {selectedStat === "overall" ? "PROMEDIO OVR" : `PROMEDIO ${selectedStat.toUpperCase()}`}</span>
              {selectedRegion && (
                <button onClick={() => setSelectedRegion(null)} style={{background:"none",border:"none",color:"#00FF94",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"10px",letterSpacing:"0.1em"}}>VER TODAS ×</button>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"72vh",overflowY:"auto",paddingRight:"4px"}}>
              {regionStats.map((reg, ri) => {
                const isSelected = selectedRegion === reg.key;
                const statAvg = reg.players.length
                  ? Math.round(reg.players.reduce((a, p) => a + getStatVal(p, selectedStat), 0) / reg.players.length)
                  : 0;
                const barPct = (statAvg / 99) * 100;
                const rankColor = ri === 0 ? "#f5d769" : ri === 1 ? "#c9d6df" : ri === 2 ? "#cd853f" : reg.color;

                return (
                  <div
                    key={reg.key}
                    onClick={() => setSelectedRegion(isSelected ? null : reg.key)}
                    style={{padding:"14px 16px",borderRadius:"12px",cursor:"pointer",transition:"all 0.2s",
                      background: isSelected ? `${reg.color}15` : "#0F0F1A",
                      border: `2px solid ${isSelected ? reg.color : "#ffffff12"}`,
                      boxShadow: isSelected ? `0 0 20px ${reg.color}22` : "none",
                    }}
                  >
                    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                      <div style={{width:"28px",textAlign:"center",flexShrink:0}}>
                        {ri < 3
                          ? <span style={{fontSize:"16px"}}>{MEDAL[ri]}</span>
                          : <span style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"13px"}}>#{ri+1}</span>
                        }
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px",color:isSelected ? reg.color : "#ECECF5"}}>{reg.label}</span>
                            <span style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Chakra Petch',sans-serif",marginLeft:"8px"}}>Reg. {reg.num}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                            <span style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"22px",color:rankColor}}>{statAvg}</span>
                            <span style={{color:"#5A5A6E",fontSize:"10px",fontFamily:"'Space Grotesk',sans-serif"}}>{reg.count} jug.</span>
                          </div>
                        </div>
                        <div style={{marginTop:"6px",height:"4px",background:"#161626",borderRadius:"2px",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${barPct}%`,background:`linear-gradient(90deg,${reg.color}66,${reg.color})`,borderRadius:"2px",transition:"width 0.6s"}}/>
                        </div>
                      </div>
                    </div>

                    {/* Top 3 mini */}
                    {reg.top.length > 0 && (
                      <div style={{display:"flex",gap:"6px",marginLeft:"38px",flexWrap:"wrap"}}>
                        {reg.top.map((p, pi) => {
                          const tk = p.cardType || getCardType(p.overall);
                          const t  = CARD_TYPES[tk] || CARD_TYPES.gold_rare;
                          return (
                            <div key={p.id} style={{display:"flex",alignItems:"center",gap:"5px",padding:"3px 8px",borderRadius:"8px",background:"#161626",border:"1px solid #ffffff0a"}}>
                              <span style={{fontSize:"10px"}}>{MEDAL[pi]}</span>
                              <span style={{color:t.accent,fontFamily:"'Space Grotesk',sans-serif",fontSize:"11px",fontWeight:700,maxWidth:"80px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                              <span style={{color:"#5A5A6E",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif"}}>{getStatVal(p, selectedStat)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {regionStats.length === 0 && (
                <div style={{textAlign:"center",padding:"40px",color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",background:"#0F0F1A",borderRadius:"12px",border:"1px solid #ffffff12"}}>
                  Ningún jugador tiene región asignada todavía
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Selected region detail / summary */}
          <div>
            {!selectedRegion ? (
              <div style={{padding:"28px",background:"#0F0F1A",borderRadius:"16px",border:"1px solid #ffffff12",textAlign:"center"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>🗺️</div>
                <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"18px",color:"#5A5A6E",letterSpacing:"-0.01em",marginBottom:"8px"}}>SELECCIONA UNA REGIÓN</div>
                <div style={{color:"#5A5A6E",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",marginBottom:"24px"}}>Haz clic en cualquier región para ver el detalle de sus cracks</div>
                {/* Summary grid */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",textAlign:"left"}}>
                  {[
                    ["Más jugadores",  regionStats[0]?.label || "—", "👥"],
                    ["Mayor promedio", regionStats.sort((a,b)=>b.avgOverall-a.avgOverall)[0]?.label || "—", "⭐"],
                    ["Con región",     players.filter(p=>p.region).length, "📍"],
                    ["Sin región",     unassigned, "❓"],
                  ].map(([label, val, icon]) => (
                    <div key={label} style={{padding:"14px",background:"#161626",borderRadius:"10px",border:"1px solid #ffffff12"}}>
                      <div style={{color:"#5A5A6E",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.12em",marginBottom:"4px"}}>{icon} {label}</div>
                      <div style={{color:"#ECECF5",fontSize:"15px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{animation:"fadeIn 0.25s ease"}}>
                {/* Region header */}
                <div style={{padding:"20px 22px",borderRadius:"14px",background:`linear-gradient(135deg,${activeRegionData?.color || "#00FF94"}15,#0F0F1A)`,border:`1px solid ${activeRegionData?.color || "#00FF94"}44`,marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"22px",color:activeRegionData?.color||"#ECECF5",letterSpacing:"-0.01em"}}>{activeRegionData?.label}</div>
                    <div style={{color:"#5A5A6E",fontSize:"12px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"2px"}}>Región {activeRegionData?.num} · Capital: {activeRegionData?.capital}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"36px",color:activeRegionData?.color||"#ECECF5",lineHeight:1}}>{regionPlayers.length}</div>
                    <div style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif"}}>cracks</div>
                  </div>
                </div>

                {regionPlayers.length === 0 ? (
                  <div style={{padding:"40px",textAlign:"center",background:"#0F0F1A",borderRadius:"14px",border:"1px solid #ffffff12",color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif"}}>
                    No hay cracks en esta región
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"60vh",overflowY:"auto",paddingRight:"4px"}}>
                    {regionPlayers.map((p, i) => {
                      const tk = p.cardType || getCardType(p.overall);
                      const t  = CARD_TYPES[tk] || CARD_TYPES.gold_rare;
                      const val = getStatVal(p, selectedStat);
                      const valColor = selectedStat === "overall"
                        ? (val>=87?"#00E5FF":val>=82?"#f5d769":val>=75?"#d4a017":val>=65?"#c9d6df":"#cd853f")
                        : statColors[selectedStat];

                      return (
                        <div
                          key={p.id}
                          onClick={() => onPlayerClick(p)}
                          style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"10px",cursor:"pointer",transition:"background 0.15s",
                            background: i < 3 ? "#161626" : "#0F0F1A",
                            border: `1px solid ${i < 3 ? t.accent + "33" : "#ffffff12"}`,
                          }}
                        >
                          <div style={{width:"28px",textAlign:"center",flexShrink:0}}>
                            {i < 3
                              ? <span style={{fontSize:"16px"}}>{MEDAL[i]}</span>
                              : <span style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"13px"}}>#{i+1}</span>
                            }
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px",color:"#ECECF5",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                            <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:"2px"}}>
                              <span style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif"}}>{p.position} · {getFlagEmoji(p.nationality)}</span>
                              <span style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif"}}>{p.club}</span>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:"6px",flexShrink:0}}>
                            <span style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"22px",color:valColor}}>{val}</span>
                            <div style={{width:"5px",height:"32px",borderRadius:"3px",background:"#161626",position:"relative",overflow:"hidden"}}>
                              <div style={{position:"absolute",bottom:0,left:0,right:0,borderRadius:"3px",background:valColor,height:`${(val/99)*100}%`,transition:"height 0.5s"}}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
