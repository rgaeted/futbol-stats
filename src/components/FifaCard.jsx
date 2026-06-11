import { CARD_TYPES, statLabels, defaultStats } from "../constants/cardTypes";
import { calcOverall, getCardType, adjustColor, getFlagEmoji } from "../utils/helpers";

function PersonSilhouette({ size: sz, color }) {
  return (
    <svg width={sz} height={sz * 1.3} viewBox="0 0 80 104" fill={color} xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="26" r="20" />
      <path d="M8 104 C8 66 24 54 40 54 C56 54 72 66 72 104 Z" />
    </svg>
  );
}

export default function FifaCard({ player, size = "full", onClick, currentUserId }) {
  const overall  = calcOverall(player.stats);
  const typeKey  = player.cardType || getCardType(overall);
  const type     = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
  const stats    = player.stats || defaultStats;
  const s        = size === "small" ? 0.45 : 1;
  const isOwner  = !!currentUserId && !!player.userId && currentUserId === player.userId;
  const silhouetteColor = type.text === "#ffffff" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.45)";

  return (
    <div
      onClick={onClick}
      style={{width:`${320*s}px`,height:`${440*s}px`,borderRadius:`${16*s}px`,background:`linear-gradient(145deg,${type.bg},${adjustColor(type.bg,-30)})`,border:`${2*s}px solid ${type.accent}`,boxShadow:`0 0 ${30*s}px ${type.glow}55,0 ${10*s}px ${30*s}px #00000088,inset 0 1px 0 ${type.accent}44`,position:"relative",overflow:"hidden",cursor:onClick?"pointer":"default",flexShrink:0,transition:"transform 0.2s,box-shadow 0.2s",fontFamily:"'Rajdhani',sans-serif"}}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 0 ${50*s}px ${type.glow}88,0 ${20*s}px ${40*s}px #00000099`; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = `0 0 ${30*s}px ${type.glow}55,0 ${10*s}px ${30*s}px #00000088`; }}}
    >
      {/* Noise texture */}
      <div style={{position:"absolute",inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,opacity:0.3,zIndex:0}} />

      {/* Shimmer diagonal */}
      <div style={{position:"absolute",top:`${-50*s}px`,left:`${-50*s}px`,width:`${200*s}px`,height:`${400*s}px`,background:`linear-gradient(135deg,${type.accent}22 0%,transparent 50%)`,transform:"rotate(-20deg)",zIndex:1}} />

      {/* Header: overall + position + flag + club */}
      <div style={{position:"relative",zIndex:2,padding:`${12*s}px ${14*s}px 0`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:`${42*s}px`,fontWeight:900,color:type.accent,lineHeight:1,textShadow:`0 0 ${10*s}px ${type.glow}`}}>{overall}</div>
          <div style={{fontSize:`${13*s}px`,fontWeight:700,color:type.accent,letterSpacing:"0.1em"}}>{player.position || "ST"}</div>
          <div style={{marginTop:`${6*s}px`}}>
            <div style={{width:`${28*s}px`,height:`${28*s}px`,borderRadius:"50%",background:`${type.accent}33`,border:`${1*s}px solid ${type.accent}66`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <span style={{fontSize:`${16*s}px`}}>{getFlagEmoji(player.nationality || "Chile")}</span>
            </div>
            <div style={{width:`${28*s}px`,height:`${20*s}px`,borderRadius:`${3*s}px`,background:`${type.accent}22`,border:`${1*s}px solid ${type.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:`${3*s}px`}}>
              <span style={{fontSize:`${8*s}px`,color:type.accent,fontWeight:700,textAlign:"center",lineHeight:1}}>{(player.club || "Club").substring(0, 6)}</span>
            </div>
          </div>
        </div>
        <div style={{background:`${type.accent}22`,border:`${1*s}px solid ${type.accent}55`,borderRadius:`${6*s}px`,padding:`${3*s}px ${7*s}px`,fontSize:`${9*s}px`,fontWeight:700,color:type.accent,letterSpacing:"0.15em"}}>{type.label.toUpperCase()}</div>
      </div>

      {/* Photo */}
      <div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"center",height:`${160*s}px`,margin:`${-10*s}px 0 0`}}>
        {player.photoUrl && isOwner
          ? <img src={player.photoUrl} alt={player.name} style={{height:"100%",objectFit:"contain",filter:`drop-shadow(0 ${4*s}px ${12*s}px #00000099)`}} />
          : player.photoUrl && !isOwner
            ? <div style={{width:`${130*s}px`,height:`${160*s}px`,display:"flex",alignItems:"center",justifyContent:"center",background:`${type.accent}11`,borderRadius:`${10*s}px ${10*s}px 0 0`}}>
                <PersonSilhouette sz={70*s} color={silhouetteColor} />
              </div>
            : <div style={{width:`${130*s}px`,height:`${160*s}px`,display:"flex",alignItems:"center",justifyContent:"center",background:`${type.accent}11`,borderRadius:`${10*s}px ${10*s}px 0 0`}}><div style={{fontSize:`${60*s}px`,opacity:0.4}}>⚽</div></div>
        }
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:`${200*s}px`,height:`${40*s}px`,background:`radial-gradient(ellipse,${type.glow}44 0%,transparent 70%)`,borderRadius:"50%"}} />
      </div>

      {/* Name */}
      <div style={{position:"relative",zIndex:2,textAlign:"center",padding:`${6*s}px ${10*s}px`,borderTop:`${1*s}px solid ${type.accent}33`,borderBottom:`${1*s}px solid ${type.accent}33`,background:`${type.accent}11`}}>
        <div style={{fontSize:`${size==="small"?14*s:20*s}px`,fontWeight:900,color:type.text==="#ffffff"?"#fff":type.accent,letterSpacing:"0.08em",textTransform:"uppercase",textShadow:type.text==="#ffffff"?`0 0 ${8*s}px ${type.glow}88`:"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{player.name || "JUGADOR"}</div>
      </div>

      {/* Stats */}
      <div style={{position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:`${4*s}px`,padding:`${10*s}px ${14*s}px`}}>
        {Object.entries(statLabels).map(([key, label]) => (
          <div key={key} style={{display:"flex",flexDirection:"column",alignItems:"center",background:`${type.accent}0d`,borderRadius:`${6*s}px`,padding:`${4*s}px ${2*s}px`}}>
            <div style={{fontSize:`${size==="small"?18*s:22*s}px`,fontWeight:900,color:type.text==="#ffffff"?"#fff":type.bg==="#0a0a1a"?"#fff":type.accent,lineHeight:1}}>{stats[key] || 0}</div>
            <div style={{fontSize:`${9*s}px`,fontWeight:700,color:`${type.accent}cc`,letterSpacing:"0.1em"}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Bottom accent line */}
      <div style={{position:"absolute",bottom:`${8*s}px`,left:0,right:0,zIndex:2,display:"flex",justifyContent:"center"}}>
        <div style={{width:`${60*s}px`,height:`${2*s}px`,background:`linear-gradient(90deg,transparent,${type.accent},transparent)`,borderRadius:"99px"}} />
      </div>
    </div>
  );
}
