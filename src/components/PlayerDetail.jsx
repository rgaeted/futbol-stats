import FifaCard from "./FifaCard";
import { CARD_TYPES } from "../constants/cardTypes";
import { calcOverall, getCardType } from "../utils/helpers";

export default function PlayerDetail({ player, currentUserId, onEdit, onDelete, onClose, onPrint }) {
  const overall  = calcOverall(player.stats);
  const typeKey  = player.cardType || getCardType(overall);
  const type     = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
  const isOwner  = !!currentUserId && currentUserId === player.userId;

  const meta = [
    ["Edad",        player.age || "—"],
    ["Nac.",        player.nationality],
    ["Número",      player.number ? `#${player.number}` : "—"],
    ["Overall",     overall],
    ["Tipo carta",  CARD_TYPES[typeKey]?.label],
    ["Creado",      new Date(player.createdAt).toLocaleDateString("es-CL")],
  ];

  return (
    <div
      style={{position:"fixed",inset:0,background:"#00000099",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{background:"#0d0d1a",border:`1px solid ${type.accent}44`,borderRadius:"20px",padding:"32px",maxWidth:"800px",width:"100%",display:"flex",gap:"32px",flexWrap:"wrap",justifyContent:"center",boxShadow:`0 0 60px ${type.glow}33`}}
      >
        <FifaCard player={player} currentUserId={currentUserId} />

        <div style={{flex:1,minWidth:"240px"}}>
          <h2 style={{margin:"0 0 6px",fontFamily:"'Rajdhani',sans-serif",color:"#fff",fontSize:"28px",fontWeight:900}}>{player.name}</h2>
          <p style={{color:type.accent,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,margin:"0 0 24px",letterSpacing:"0.1em"}}>{player.position} · {player.club}</p>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"24px"}}>
            {meta.map(([k, v]) => (
              <div key={k} style={{background:"#1a1a2e",borderRadius:"10px",padding:"10px 14px",border:"1px solid #222"}}>
                <div style={{color:"#555",fontSize:"10px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.1em"}}>{k}</div>
                <div style={{color:"#fff",fontSize:"16px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {isOwner && (
              <button onClick={onEdit} style={{padding:"12px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>✏️ EDITAR</button>
            )}
            <button onClick={onPrint} style={{padding:"12px",borderRadius:"10px",border:"1px solid #6c63ff55",background:"#6c63ff22",color:"#6c63ff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>🖨️ IMPRIMIR</button>
            {isOwner && (
              <button onClick={onDelete} style={{padding:"12px",borderRadius:"10px",border:"1px solid #ff4d4d55",background:"#ff4d4d11",color:"#ff4d4d",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>🗑️ ELIMINAR</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
