import { useId } from "react";
import { CARD_TYPES, statLabels, defaultStats } from "../constants/cardTypes";
import { calcOverall, getCardType, getFlagEmoji } from "../utils/helpers";
import { getAgeCategory } from "../constants/ageCategories";

// Rich per-type palette for internal card rendering
const PALETTE = {
  gold_rare:    { bg1:"#f0d055", bg2:"#c49a18", bg3:"#e6c440", lines:"#fff0a0", text:"#3a2800", num:"#2a1c00", glow:"#f5d769" },
  gold_nonrare: { bg1:"#e0bc38", bg2:"#a88410", bg3:"#d0a828", lines:"#f5e080", text:"#3a2800", num:"#2a1c00", glow:"#d4a017" },
  silver:       { bg1:"#d2dae2", bg2:"#94a4b4", bg3:"#bcc6d0", lines:"#eef2f6", text:"#1a2430", num:"#101820", glow:"#c9d6df" },
  bronze:       { bg1:"#d49060", bg2:"#9a5e28", bg3:"#c07840", lines:"#f0b878", text:"#2a1200", num:"#1e0c00", glow:"#cd853f" },
  toty:         { bg1:"#0e2046", bg2:"#040c22", bg3:"#0a1838", lines:"#22ddff", text:"#d8f0ff", num:"#22ddff", glow:"#00d4ff" },
  inform:       { bg1:"#0c2e14", bg2:"#02180a", bg3:"#082610", lines:"#22ff99", text:"#d8ffe8", num:"#22ff99", glow:"#00ff88" },
  hero:         { bg1:"#220a32", bg2:"#0c0218", bg3:"#180628", lines:"#ff80d0", text:"#ffe0f4", num:"#ff80d0", glow:"#ff6ec7" },
};

// SVG silhouette rendered inside the card's SVG context
function SvgSilhouette({ cx, cy, sz, color }) {
  const scale = sz / 80;
  const tx = cx - 40 * scale;
  const ty = cy - 52 * scale;
  return (
    <g transform={`translate(${tx}, ${ty}) scale(${scale})`} fill={color}>
      <circle cx="40" cy="26" r="20" />
      <path d="M8 104 C8 66 24 54 40 54 C56 54 72 66 72 104 Z" />
    </g>
  );
}

export default function FifaCard({ player, size = "full", onClick, currentUserId }) {
  const uid      = useId();
  const overall  = calcOverall(player.stats);
  const typeKey  = player.cardType || getCardType(overall);
  const p        = PALETTE[typeKey] || PALETTE.gold_rare;
  const stats    = player.stats || defaultStats;
  const s        = size === "small" ? 0.46 : size === "medium" ? 0.70 : 1;
  const isOwner  = !!currentUserId && !!player.userId && currentUserId === player.userId;
  const isDark   = ["toty", "inform", "hero"].includes(typeKey);

  const ageCat = getAgeCategory(player.birthDate);

  const w = Math.round(270 * s);
  const h = Math.round(400 * s);

  const clipId   = `clip-${uid}`;
  const gradId   = `grad-${uid}`;
  const photoClip= `pc-${uid}`;

  // FIFA shield path
  const shield = `M ${w*.5} ${h*.02}
    C ${w*.42} ${h*.06}, ${w*.30} ${h*.07}, ${w*.14} ${h*.05}
    C ${w*.06} ${h*.045}, ${w*.02} ${h*.06}, ${w*.02} ${h*.12}
    L ${w*.02} ${h*.74}
    C ${w*.02} ${h*.82}, ${w*.06} ${h*.86}, ${w*.16} ${h*.90}
    C ${w*.30} ${h*.95}, ${w*.42} ${h*.985}, ${w*.5} ${h*.998}
    C ${w*.58} ${h*.985}, ${w*.70} ${h*.95}, ${w*.84} ${h*.90}
    C ${w*.94} ${h*.86}, ${w*.98} ${h*.82}, ${w*.98} ${h*.74}
    L ${w*.98} ${h*.12}
    C ${w*.98} ${h*.06}, ${w*.94} ${h*.045}, ${w*.86} ${h*.05}
    C ${w*.70} ${h*.07}, ${w*.58} ${h*.06}, ${w*.5} ${h*.02} Z`;

  // Stats paired left/right columns
  const statPairs = [["pace","dribbling"],["shooting","defending"],["passing","physical"]];
  const silhouetteColor = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.32)";

  return (
    <div
      onClick={onClick}
      style={{width:`${w}px`,height:`${h}px`,position:"relative",flexShrink:0,cursor:onClick?"pointer":"default",transition:"transform 0.2s,filter 0.2s",filter:`drop-shadow(0 ${6*s}px ${16*s}px #00000066)`}}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.filter=`drop-shadow(0 0 ${22*s}px ${p.glow})`; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.filter=`drop-shadow(0 ${6*s}px ${16*s}px #00000066)`; }}}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute",inset:0}}>
        <defs>
          <clipPath id={clipId}><path d={shield}/></clipPath>
          <clipPath id={photoClip}><rect x={w*.30} y={h*.04} width={w*.70} height={h*.52}/></clipPath>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={p.bg1}/>
            <stop offset="50%"  stopColor={p.bg2}/>
            <stop offset="100%" stopColor={p.bg3}/>
          </linearGradient>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Base gradient */}
          <rect x="0" y="0" width={w} height={h} fill={`url(#${gradId})`}/>

          {/* Diagonal accent lines top-right */}
          <g opacity="0.3">
            {[0,14,28,42].map((o,i)=>(
              <line key={i} x1={w*.55+o*s} y1="0" x2={w+o*s} y2={h*.35-o*s} stroke={p.lines} strokeWidth={i===1?4*s:1.5*s}/>
            ))}
            <line x1={w*.45} y1="0" x2={w} y2={h*.45} stroke={p.lines} strokeWidth={24*s} opacity="0.4"/>
          </g>
          {/* Triangle dots */}
          <g opacity="0.3" fill={p.lines}>
            {[0,1,2,3].map(r=>[0,1,2].map(c=>(
              <polygon key={`${r}-${c}`} points={`${w*.62+c*16*s},${h*.05+r*14*s} ${w*.62+c*16*s+6*s},${h*.05+r*14*s+9*s} ${w*.62+c*16*s-6*s},${h*.05+r*14*s+9*s}`}/>
            )))}
          </g>

          {/* Photo / empty — offset applied via clipPath + translate */}
          {player.photoUrl ? (
            <g clipPath={`url(#${photoClip})`}>
              <image
                href={player.photoUrl}
                x={w*.30 + (player.photoOffsetX||0)/100 * w*.35}
                y={h*.04 + (player.photoOffsetY||0)/100 * h*.26}
                width={w*.70}
                height={h*.52}
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          ) : (
            <text x={w*.66} y={h*.34} textAnchor="middle" fontSize={`${38*s}px`} opacity="0.28">⚽</text>
          )}

          {/* Bottom panel overlay */}
          <rect x="0" y={h*.54} width={w} height={h*.46} fill={p.bg3} opacity="0.45"/>
        </g>

        {/* Shield border */}
        <path d={shield} fill="none" stroke={p.lines} strokeWidth={size==="small"?2.5:3.5} opacity="0.8"/>
        <path d={shield} fill="none" stroke={isDark?p.num:"#ffffff"} strokeWidth="1" opacity="0.25"
          transform={`translate(${w*.015},${h*.01}) scale(0.97,0.97)`}/>
      </svg>

      {/* ── LEFT COLUMN: OVR · POS · FLAG · SHIELD ── */}
      <div style={{position:"absolute",top:`${h*.10}px`,left:`${w*.07}px`,textAlign:"center",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:`${3*s}px`}}>
        <div style={{fontSize:`${44*s}px`,fontWeight:900,lineHeight:0.9,color:p.num,fontFamily:"'Archivo',sans-serif",textShadow:isDark?`0 0 ${8*s}px ${p.glow}`:"none"}}>{overall}</div>
        <div style={{fontSize:`${13*s}px`,fontWeight:600,color:p.num,letterSpacing:"0.06em",lineHeight:1,opacity:0.9,fontFamily:"'Chakra Petch',sans-serif"}}>{player.position||"ST"}</div>
        <div style={{width:`${26*s}px`,height:`${1*s}px`,background:`${p.text}44`,margin:`${2*s}px 0`}}/>
        <div style={{fontSize:`${18*s}px`,lineHeight:1}}>{getFlagEmoji(player.nationality||"Chile")}</div>
        <div style={{width:`${22*s}px`,height:`${22*s}px`,borderRadius:"50%",background:`${p.text}18`,border:`${1*s}px solid ${p.text}2a`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:`${12*s}px`}}>🛡️</div>
        {ageCat && (
          <div style={{marginTop:`${3*s}px`,padding:`${2*s}px ${5*s}px`,borderRadius:`${4*s}px`,background:"rgba(0,0,0,0.72)",border:`${0.8*s}px solid ${ageCat.color}`,textAlign:"center"}}>
            <div style={{fontSize:`${7.5*s}px`,fontWeight:700,color:ageCat.color,fontFamily:"'Chakra Petch',sans-serif",letterSpacing:"0.04em",lineHeight:1.2,whiteSpace:"nowrap"}}>{ageCat.icon} {ageCat.label}</div>
          </div>
        )}
      </div>

      {/* ── NAME ── */}
      <div style={{position:"absolute",top:`${h*.52}px`,left:0,right:0,textAlign:"center",zIndex:10,
        fontSize:`${size==="small"?18*s:23*s}px`,fontWeight:900,color:p.text,letterSpacing:"0.05em",
        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",padding:`0 ${18*s}px`,
        textTransform:"uppercase",textShadow:isDark?`0 0 ${6*s}px ${p.glow}55`:"none",
        fontFamily:"'Archivo',sans-serif"}}>
        {player.name||"JUGADOR"}
      </div>

      {/* Thin divider */}
      <div style={{position:"absolute",top:`${h*.595}px`,left:`${w*.12}px`,right:`${w*.12}px`,height:`${1.5*s}px`,background:`linear-gradient(90deg,transparent,${p.text}44,transparent)`,zIndex:10}}/>

      {/* ── STATS 2-COLUMN ── */}
      <div style={{position:"absolute",top:`${h*.625}px`,left:`${w*.14}px`,right:`${w*.14}px`,zIndex:10,display:"flex"}}>
        {[0,1].map(col=>(
          <div key={col} style={{display:"flex",flexDirection:"column",gap:`${size==="small"?3*s:5*s}px`,flex:1,alignItems:"center",paddingLeft:col===1?`${10*s}px`:0,paddingRight:col===0?`${10*s}px`:0,borderLeft:col===1?`${1*s}px solid ${p.text}2a`:"none"}}>
            {statPairs.map(pair=>{
              const key=pair[col];
              return (
                <div key={key} style={{display:"flex",alignItems:"baseline",gap:`${5*s}px`,justifyContent:"flex-start",width:`${50*s}px`}}>
                  <span style={{fontSize:`${size==="small"?15*s:20*s}px`,fontWeight:900,color:p.text,fontFamily:"'Archivo',sans-serif",minWidth:`${20*s}px`}}>{stats[key]||0}</span>
                  <span style={{fontSize:`${size==="small"?9*s:11*s}px`,fontWeight:600,color:p.text,opacity:0.65,letterSpacing:"0.06em",fontFamily:"'Chakra Petch',sans-serif"}}>{statLabels[key]}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Card type label bottom */}
      <div style={{position:"absolute",bottom:`${h*.045}px`,left:0,right:0,textAlign:"center",zIndex:10}}>
        <span style={{fontSize:`${7*s}px`,fontWeight:600,color:isDark?p.num:p.text,opacity:0.55,letterSpacing:"0.2em",fontFamily:"'Chakra Petch',sans-serif"}}>{CARD_TYPES[typeKey]?.label?.toUpperCase()}</span>
      </div>
    </div>
  );
}
