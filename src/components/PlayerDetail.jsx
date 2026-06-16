import FifaCard from "./FifaCard";
import { CARD_TYPES } from "../constants/cardTypes";
import { REGIONS_CHILE } from "../constants/regions";
import { getAgeCategory, calcAge, formatBirthDate } from "../constants/ageCategories";
import { calcOverall, getCardType } from "../utils/helpers";

export default function PlayerDetail({ player, currentUserId, isAdmin, onEdit, onDelete, onClose, onPrint, onEvaluate }) {
  const overall  = calcOverall(player.stats);
  const typeKey  = player.cardType || getCardType(overall);
  const type     = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
  const region   = REGIONS_CHILE.find(r => r.key === player.region);
  const ageCat   = getAgeCategory(player.birthDate);
  const age      = calcAge(player.birthDate);

  const meta = [
    ["F. Nacimiento", formatBirthDate(player.birthDate) || "—"],
    ["Edad",          age !== null ? `${age} años` : "—"],
    ["Nac.",          player.nationality],
    ["Número",        player.number ? `#${player.number}` : "—"],
    ["Overall",       overall],
    ["Tipo carta",    CARD_TYPES[typeKey]?.label],
    ["Creado",        new Date(player.createdAt).toLocaleDateString("es-CL")],
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"#000000bb", zIndex:100,
        overflowY:"auto", padding:"16px",
        display:"flex", alignItems:"flex-start", justifyContent:"center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"#0F0F1A",
          border:`1px solid ${type.accent}33`,
          borderRadius:"20px",
          padding:"24px",
          width:"100%",
          maxWidth:"780px",
          margin:"auto",
          boxShadow:`0 0 60px ${type.glow}22`,
          position:"relative",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{position:"absolute",top:"16px",right:"16px",width:"32px",height:"32px",borderRadius:"50%",border:"1px solid #ffffff18",background:"#161626",color:"#5A5A6E",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,zIndex:10}}
        >✕</button>

        {/* Layout: carta + info */}
        <div style={{display:"flex", gap:"28px", flexWrap:"wrap", justifyContent:"center", alignItems:"flex-start"}}>

          {/* Carta — medium en móvil via tamaño responsive */}
          <div style={{flexShrink:0}}>
            <FifaCard player={player} currentUserId={currentUserId} size="medium" />
          </div>

          {/* Info */}
          <div style={{flex:1, minWidth:"220px"}}>
            <h2 style={{margin:"0 0 4px",fontFamily:"'Archivo',sans-serif",fontWeight:900,color:"#ECECF5",fontSize:"clamp(20px,5vw,28px)",letterSpacing:"-0.01em",paddingRight:"36px"}}>{player.name}</h2>
            <p style={{color:type.accent,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,margin:"0 0 12px",letterSpacing:"0.08em",fontSize:"13px"}}>{player.position} · {player.club}</p>

            {/* Badges */}
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"14px"}}>
              {ageCat && (
                <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"20px",background:`${ageCat.color}18`,border:`1px solid ${ageCat.color}44`}}>
                  <span>{ageCat.icon}</span>
                  <span style={{color:ageCat.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"11px"}}>{ageCat.label}</span>
                  {age !== null && <span style={{color:"#5A5A6E",fontSize:"10px",fontFamily:"'Space Grotesk',sans-serif"}}>· {age} años</span>}
                </div>
              )}
              {region && (
                <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"20px",background:`${region.color}18`,border:`1px solid ${region.color}44`}}>
                  <span style={{color:region.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"11px"}}>📍 {region.label}</span>
                </div>
              )}
            </div>

            {/* Meta grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"20px"}}>
              {meta.map(([k, v]) => (
                <div key={k} style={{background:"#161626",borderRadius:"8px",padding:"8px 12px",border:"1px solid #ffffff12"}}>
                  <div style={{color:"#5A5A6E",fontSize:"9px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.12em",marginBottom:"2px"}}>{k}</div>
                  <div style={{color:"#ECECF5",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {isAdmin && (
                <button onClick={onEvaluate} style={{padding:"11px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#7B5BFF,#5B3BDF)",color:"#fff",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px",boxShadow:"0 2px 12px #7B5BFF44"}}>📋 EVALUAR</button>
              )}
              {isAdmin && (
                <button onClick={onEdit} style={{padding:"11px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px",boxShadow:"0 2px 12px #00ff9433"}}>✏️ EDITAR</button>
              )}
              {isAdmin && (
                <button onClick={onPrint} style={{padding:"11px",borderRadius:"10px",border:"1px solid #00FF9433",background:"#00FF9411",color:"#00FF94",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px"}}>🖨️ IMPRIMIR</button>
              )}
              {isAdmin && (
                <button onClick={onDelete} style={{padding:"11px",borderRadius:"10px",border:"1px solid #ff4d4d55",background:"#ff4d4d11",color:"#ff4d4d",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"14px"}}>🗑️ ELIMINAR</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
