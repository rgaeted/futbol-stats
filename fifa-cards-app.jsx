import { useState, useEffect } from "react";

const DB_KEY = "fifa_players_db";
const db = {
  getAll: () => { try { return JSON.parse(localStorage.getItem(DB_KEY) || "[]"); } catch { return []; } },
  save: (p) => localStorage.setItem(DB_KEY, JSON.stringify(p)),
  add: (player) => { const all = db.getAll(); const n = { ...player, id: Date.now(), createdAt: new Date().toISOString() }; db.save([...all, n]); return n; },
  update: (id, data) => { db.save(db.getAll().map(p => p.id === id ? { ...p, ...data } : p)); },
  delete: (id) => db.save(db.getAll().filter(p => p.id !== id)),
};

const POSITIONS     = ["ST","CF","LW","RW","CAM","CM","CDM","LM","RM","LB","RB","CB","GK"];
const NATIONALITIES = ["Argentina","Brasil","Chile","Colombia","Uruguay","México","España","Francia","Alemania","Inglaterra","Portugal","Italia","Holanda","Bélgica","Croacia"];
const CLUBS         = ["Real Madrid","Barcelona","Atlético Madrid","Manchester City","Liverpool","Chelsea","Arsenal","PSG","Bayern Munich","Juventus","Inter Milan","Boca Juniors","River Plate","Flamengo","Colo-Colo","Universidad de Chile","Universidad Católica","Otro"];

const CARD_TYPES = {
  gold_rare:    { label:"Gold Rare", bg:"#c9a227", accent:"#f5d769", text:"#3d2800", glow:"#f5d769" },
  gold_nonrare: { label:"Gold",      bg:"#b8860b", accent:"#d4a017", text:"#3d2800", glow:"#d4a017" },
  silver:       { label:"Silver",    bg:"#8e9eab", accent:"#c9d6df", text:"#1a1a2e", glow:"#c9d6df" },
  bronze:       { label:"Bronze",    bg:"#a0522d", accent:"#cd853f", text:"#2d1200", glow:"#cd853f" },
  toty:         { label:"TOTY",      bg:"#0a0a1a", accent:"#00d4ff", text:"#ffffff", glow:"#00d4ff" },
  inform:       { label:"In Form",   bg:"#1a3a1a", accent:"#00ff88", text:"#ffffff", glow:"#00ff88" },
  hero:         { label:"Hero",      bg:"#1a0a2e", accent:"#ff6ec7", text:"#ffffff", glow:"#ff6ec7" },
};

const statLabels  = { pace:"PAC", shooting:"SHO", passing:"PAS", dribbling:"DRI", defending:"DEF", physical:"PHY" };
const statColors  = { pace:"#00d4ff", shooting:"#ff6b6b", passing:"#00ff88", dribbling:"#ffd93d", defending:"#6c63ff", physical:"#ff6ec7" };
const defaultStats= { pace:70, shooting:70, passing:70, dribbling:70, defending:70, physical:70 };

const PROTOCOLS = [
  {
    key:"pace", label:"VELOCIDAD", abbr:"PAC", color:"#00d4ff", icon:"⚡",
    description:"Mide la velocidad máxima de sprint y aceleración explosiva del jugador en cancha.",
    equipment:["Conos de señalización","Cronómetro o app de timing","Cinta métrica (30 m)","Pista plana de césped o sintético"],
    tests:[
      { name:"Sprint 30 metros", objective:"Medir velocidad máxima de carrera",
        setup:"Coloca conos a 0 m y 30 m sobre una línea recta en el campo. El jugador parte desde posición estática con un pie adelantado.",
        execution:"El evaluador da la señal (silbato). El jugador acelera a máxima velocidad hasta el cono de llegada. Se cronometra desde la señal hasta cruzar la línea.",
        attempts:2, best:"Se toma el mejor de 2 intentos con 3 min de descanso entre ellos.",
        scoring:[
          { range:"< 3.8 seg",  pts:"92–99", label:"Élite mundial" },
          { range:"3.8–4.1 seg",pts:"80–91", label:"Muy rápido" },
          { range:"4.2–4.5 seg",pts:"65–79", label:"Rápido" },
          { range:"4.6–4.9 seg",pts:"48–64", label:"Promedio" },
          { range:"5.0–5.4 seg",pts:"30–47", label:"Lento" },
          { range:"> 5.4 seg",  pts:"10–29", label:"Muy lento" },
        ]
      },
      { name:"Aceleración 10 metros", objective:"Medir capacidad de arranque explosivo",
        setup:"Conos a 0 m y 10 m. Misma metodología que los 30 m. Se puede hacer en el mismo recorrido midiendo la marca a los 10 m.",
        execution:"El jugador parte desde posición estática. Se cronometra solo hasta los 10 m. Permite evaluar la explosividad del primer paso.",
        attempts:2, best:"Se promedia la puntuación con el sprint de 30 m según la fórmula.",
        scoring:[
          { range:"< 1.65 seg",  pts:"92–99", label:"Explosivo élite" },
          { range:"1.65–1.80 seg",pts:"78–91",label:"Muy explosivo" },
          { range:"1.81–1.95 seg",pts:"60–77",label:"Bueno" },
          { range:"1.96–2.10 seg",pts:"42–59",label:"Promedio" },
          { range:"> 2.10 seg",  pts:"10–41", label:"Por mejorar" },
        ]
      }
    ],
    formula:"PAC = (Puntos sprint 30m × 0.60) + (Puntos aceleración 10m × 0.40)"
  },
  {
    key:"shooting", label:"DISPARO", abbr:"SHO", color:"#ff6b6b", icon:"🎯",
    description:"Evalúa la potencia, precisión y técnica de remate al arco desde distintas situaciones.",
    equipment:["Balones de fútbol (mínimo 5)","Arco reglamentario","Cinta adhesiva para zonas del arco","Cinta métrica","Velocímetro de balón (opcional)"],
    tests:[
      { name:"Precisión de disparo (10 remates)", objective:"Medir porcentaje de acierto al arco dividido en zonas",
        setup:"Divide el arco en 6 zonas con cinta: esquinas altas (×2), esquinas bajas (×2), centro alto y centro bajo. Jugador a 16.5 m (punto de penal). Sin portero.",
        execution:"El jugador ejecuta 10 disparos consecutivos al arco estático. Se registra: gol / fuera / zona impactada. Esquinas valen 2 pts, centro vale 1 pt.",
        attempts:10, best:"Suma total de puntos según zonas acertadas (máx 20 pts).",
        scoring:[
          { range:"17–20 pts", pts:"90–99", label:"Francotirador" },
          { range:"13–16 pts", pts:"74–89", label:"Muy preciso" },
          { range:"9–12 pts",  pts:"56–73", label:"Preciso" },
          { range:"5–8 pts",   pts:"36–55", label:"Regular" },
          { range:"1–4 pts",   pts:"18–35", label:"Impreciso" },
          { range:"0 pts",     pts:"10–17", label:"Muy impreciso" },
        ]
      },
      { name:"Potencia de disparo (velocímetro)", objective:"Velocidad máxima del balón en disparo con pierna dominante",
        setup:"Balón estático a 11 m del arco. Velocímetro o app de radar ubicado detrás del arco. Zona libre alrededor del jugador.",
        execution:"El jugador ejecuta 3 disparos máximos con pierna dominante. Se registra la velocidad de cada balón en km/h. Sin carrerilla larga.",
        attempts:3, best:"Se toma la velocidad máxima de los 3 intentos.",
        scoring:[
          { range:"> 110 km/h",  pts:"90–99", label:"Cañonero élite" },
          { range:"90–110 km/h", pts:"72–89", label:"Muy potente" },
          { range:"70–89 km/h",  pts:"52–71", label:"Bueno" },
          { range:"50–69 km/h",  pts:"30–51", label:"Moderado" },
          { range:"< 50 km/h",   pts:"10–29", label:"Débil" },
        ]
      }
    ],
    formula:"SHO = (Precisión × 0.55) + (Potencia × 0.30) + (Técnica de golpeo observada por evaluador × 0.15)"
  },
  {
    key:"passing", label:"PASE", abbr:"PAS", color:"#00ff88", icon:"🔁",
    description:"Evalúa la precisión, variedad y visión de juego en la distribución del balón a distintas distancias.",
    equipment:["Balones de fútbol (mínimo 6)","5 conos en posiciones específicas","Pared de rebote o compañero evaluador","Cinta métrica"],
    tests:[
      { name:"Precisión pase corto/medio (10 pases)", objective:"Porcentaje de pases completados a blancos en distintas distancias y ángulos",
        setup:"Coloca 5 conos a 10m, 15m, 20m, 25m y 30m del jugador en ángulos variados (no en línea recta). Cada cono = un 'compañero'. Se realizan 2 pases por cono.",
        execution:"El jugador ejecuta los 10 pases alternando pies cuando sea posible. Pase exitoso: balón pasa a menos de 1 m del cono con trayectoria controlada.",
        attempts:10, best:"Se cuenta el número de pases precisos de 10.",
        scoring:[
          { range:"10/10",   pts:"95–99", label:"Perfecto" },
          { range:"8–9/10",  pts:"78–94", label:"Muy preciso" },
          { range:"6–7/10",  pts:"58–77", label:"Bueno" },
          { range:"4–5/10",  pts:"38–57", label:"Promedio" },
          { range:"< 4/10",  pts:"10–37", label:"Por mejorar" },
        ]
      },
      { name:"Pase largo (8 intentos)", objective:"Precisión en pases largos de 30–40 metros",
        setup:"Zona circular de 3 m de diámetro (marcada con conos) a 35 m del jugador. El jugador debe golpear el balón hacia la zona con precisión.",
        execution:"5 intentos con pierna dominante y 3 con pierna no dominante. Se anota como exitoso si el balón cae dentro o toca la zona circular.",
        attempts:8, best:"Total de aciertos sobre 8 ponderado según pierna usada.",
        scoring:[
          { range:"7–8 aciertos", pts:"88–99", label:"Visión élite" },
          { range:"5–6 aciertos", pts:"68–87", label:"Muy bueno" },
          { range:"3–4 aciertos", pts:"46–67", label:"Bueno" },
          { range:"1–2 aciertos", pts:"24–45", label:"Regular" },
          { range:"0 aciertos",   pts:"10–23", label:"Por mejorar" },
        ]
      }
    ],
    formula:"PAS = (Precisión corto/medio × 0.50) + (Pase largo × 0.35) + (Pierna no dominante observada × 0.15)"
  },
  {
    key:"dribbling", label:"REGATE", abbr:"DRI", color:"#ffd93d", icon:"🌀",
    description:"Mide el control del balón en movimiento, cambios de dirección y habilidad técnica individual.",
    equipment:["Balones de fútbol","8 conos o postes de slalom separados 1.5 m","Cronómetro","Cinta métrica (espacio mínimo 20 m)"],
    tests:[
      { name:"Slalom cronometrado (ida y vuelta)", objective:"Velocidad de conducción con regate entre conos",
        setup:"8 conos separados 1.5 m entre sí en línea recta (total ~12 m). El jugador conduce el balón en slalom de ida, rodea el último cono y vuelve en slalom.",
        execution:"Jugador conduce el balón zigzagueando todos los conos de ida y vuelta sin perderlo. PENALIZACIÓN: +0.5 seg por cada cono derribado. Balón perdido = intento inválido.",
        attempts:2, best:"Se toma el mejor tiempo válido de 2 intentos.",
        scoring:[
          { range:"< 7.0 seg",   pts:"92–99", label:"Maestro del regate" },
          { range:"7.0–8.5 seg", pts:"74–91", label:"Muy hábil" },
          { range:"8.6–10.0 seg",pts:"54–73", label:"Bueno" },
          { range:"10.1–12.0 seg",pts:"32–53",label:"Promedio" },
          { range:"> 12.0 seg",  pts:"10–31", label:"Por desarrollar" },
        ]
      },
      { name:"Control y toque (jueguito)", objective:"Número máximo de toques consecutivos sin perder el balón",
        setup:"El jugador en espacio libre de al menos 3×3 m. Puede usar cualquier parte del cuerpo excepto brazos y manos. El evaluador cuenta en voz alta.",
        execution:"Se mide el número máximo de toques en 2 intentos de 60 segundos. Si pierde el balón durante el intento, se cuenta lo acumulado hasta ese momento.",
        attempts:2, best:"Se toma el número máximo de toques conseguido en cualquier intento.",
        scoring:[
          { range:"> 80 toques",  pts:"90–99", label:"Técnico élite" },
          { range:"60–80 toques", pts:"72–89", label:"Muy técnico" },
          { range:"40–59 toques", pts:"52–71", label:"Bueno" },
          { range:"20–39 toques", pts:"30–51", label:"Promedio" },
          { range:"< 20 toques",  pts:"10–29", label:"Básico" },
        ]
      }
    ],
    formula:"DRI = (Slalom cronometrado × 0.55) + (Control y toque × 0.45)"
  },
  {
    key:"defending", label:"DEFENSA", abbr:"DEF", color:"#6c63ff", icon:"🛡️",
    description:"Evalúa la capacidad de recuperación de balón, posicionamiento defensivo y anticipación táctica.",
    equipment:["Balones de fútbol","Conos de delimitación (zona 10×10 m)","1 evaluador como atacante","1 evaluador como pasador adicional","Cronómetro"],
    tests:[
      { name:"1v1 Defensivo (5 rondas)", objective:"Porcentaje de balones recuperados en situación uno contra uno",
        setup:"Zona cuadrada de 10×10 m delimitada con conos. Un atacante conduce el balón dentro de la zona. El defensor parte del centro. El atacante intenta mantener la posesión.",
        execution:"5 rondas de 30 segundos cada una. El defensor debe robar el balón o sacarlo de la zona. Se cuenta: recuperaciones del defensor vs total de posesiones del atacante.",
        attempts:5, best:"% de recuperación = recuperaciones / total posesiones del atacante × 100.",
        scoring:[
          { range:"≥ 75%", pts:"88–99", label:"Marcador férreo" },
          { range:"60–74%",pts:"70–87", label:"Muy sólido" },
          { range:"45–59%",pts:"50–69", label:"Bueno" },
          { range:"30–44%",pts:"30–49", label:"Promedio" },
          { range:"< 30%", pts:"10–29", label:"Por mejorar" },
        ]
      },
      { name:"Interceptación de pases (60 seg)", objective:"Número de pases interceptados en movimiento",
        setup:"Dos pasadores a 15 m de distancia entre sí. El defensor parte del centro entre ambos. Los pasadores se hacen pases suaves/medios intentando no ser interceptados.",
        execution:"60 segundos continuos. Se cuentan las interceptaciones logradas por el defensor (toque claro al balón en vuelo o suelo antes del receptor).",
        attempts:1, best:"Número total de interceptaciones en 60 segundos.",
        scoring:[
          { range:"≥ 8", pts:"88–99", label:"Lector del juego" },
          { range:"6–7", pts:"70–87", label:"Muy anticipador" },
          { range:"4–5", pts:"50–69", label:"Bueno" },
          { range:"2–3", pts:"28–49", label:"Promedio" },
          { range:"0–1", pts:"10–27", label:"Por mejorar" },
        ]
      }
    ],
    formula:"DEF = (1v1 defensivo × 0.60) + (Interceptación de pases × 0.40)"
  },
  {
    key:"physical", label:"FÍSICO", abbr:"PHY", color:"#ff6ec7", icon:"💪",
    description:"Evalúa la resistencia aeróbica, fuerza explosiva y capacidad de duelo físico del jugador.",
    equipment:["Cinta métrica (20 m)","Conos de delimitación","Cronómetro / app de Yo-Yo test","Silbato o audio del test","Pared o tablero de salto vertical"],
    tests:[
      { name:"Test Yo-Yo Intermitente (Nivel 1)", objective:"Medir capacidad aeróbica y resistencia máxima estimada (VO2max)",
        setup:"Dos líneas paralelas separadas exactamente 20 m marcadas con conos. Una zona de recuperación de 5 m detrás de la línea de inicio. El audio del test dicta los tiempos.",
        execution:"El jugador corre entre las dos líneas al ritmo de los pitidos del audio. Cada nivel acelera el ritmo. Tiene 10 seg de descanso entre series. El test termina cuando el jugador no llega en 2 ocasiones consecutivas.",
        attempts:1, best:"Se registra el último nivel y número de repetición completada.",
        scoring:[
          { range:"Nivel ≥ 19",  pts:"90–99", label:"Resistencia élite" },
          { range:"Nivel 16–18", pts:"72–89", label:"Muy buena" },
          { range:"Nivel 13–15", pts:"52–71", label:"Buena" },
          { range:"Nivel 10–12", pts:"32–51", label:"Promedio" },
          { range:"Nivel < 10",  pts:"10–31", label:"Por desarrollar" },
        ]
      },
      { name:"Salto Vertical (CMJ)", objective:"Medir altura de salto vertical con contramovimiento (fuerza explosiva de piernas)",
        setup:"Pared lisa con cinta métrica pegada o tablero de salto. El jugador se para al lado con el brazo extendido al máximo y marca su alcance estático (referencia).",
        execution:"El jugador flexiona rodillas libremente (contramovimiento) y salta al máximo, tocando la pared en el punto más alto. 3 intentos con 60 seg de descanso. Se mide la diferencia entre marca de salto y marca estática.",
        attempts:3, best:"Se toma el mejor salto de 3 intentos (mayor diferencia en cm).",
        scoring:[
          { range:"> 70 cm",  pts:"90–99", label:"Potencia élite" },
          { range:"60–70 cm", pts:"72–89", label:"Muy potente" },
          { range:"48–59 cm", pts:"52–71", label:"Bueno" },
          { range:"35–47 cm", pts:"30–51", label:"Promedio" },
          { range:"< 35 cm",  pts:"10–29", label:"Por mejorar" },
        ]
      }
    ],
    formula:"PHY = (Test Yo-Yo × 0.55) + (Salto vertical CMJ × 0.30) + (Índice de masa corporal y complexión observada × 0.15)"
  }
];

const calcOverall = (stats) => {
  if (!stats) return 0;
  const vals = Object.values(stats).map(Number).filter(v => !isNaN(v));
  return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
};
const getCardType = (o) => o>=87?"toty":o>=82?"gold_rare":o>=75?"gold_nonrare":o>=65?"silver":"bronze";
const adjustColor = (hex, amt) => {
  const n=parseInt(hex.replace("#",""),16);
  const r=Math.min(255,Math.max(0,(n>>16)+amt));
  const g=Math.min(255,Math.max(0,((n>>8)&0xff)+amt));
  const b=Math.min(255,Math.max(0,(n&0xff)+amt));
  return "#"+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
};
const getFlagEmoji = (c) => ({Argentina:"🇦🇷",Brasil:"🇧🇷",Chile:"🇨🇱",Colombia:"🇨🇴",Uruguay:"🇺🇾",México:"🇲🇽",España:"🇪🇸",Francia:"🇫🇷",Alemania:"🇩🇪",Inglaterra:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Portugal:"🇵🇹",Italia:"🇮🇹",Holanda:"🇳🇱",Bélgica:"🇧🇪",Croacia:"🇭🇷"})[c]||"🌐";

function FifaCard({ player, size="full", onClick }) {
  const overall = calcOverall(player.stats);
  const typeKey  = player.cardType || getCardType(overall);
  const type     = CARD_TYPES[typeKey] || CARD_TYPES.gold_rare;
  const stats    = player.stats || defaultStats;
  const s        = size==="small" ? 0.45 : 1;
  return (
    <div onClick={onClick} style={{ width:`${320*s}px`,height:`${440*s}px`,borderRadius:`${16*s}px`,background:`linear-gradient(145deg,${type.bg},${adjustColor(type.bg,-30)})`,border:`${2*s}px solid ${type.accent}`,boxShadow:`0 0 ${30*s}px ${type.glow}55,0 ${10*s}px ${30*s}px #00000088,inset 0 1px 0 ${type.accent}44`,position:"relative",overflow:"hidden",cursor:onClick?"pointer":"default",flexShrink:0,transition:"transform 0.2s,box-shadow 0.2s",fontFamily:"'Rajdhani',sans-serif" }}
      onMouseEnter={e=>{ if(onClick){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 0 ${50*s}px ${type.glow}88,0 ${20*s}px ${40*s}px #00000099`;}}}
      onMouseLeave={e=>{ if(onClick){e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 0 ${30*s}px ${type.glow}55,0 ${10*s}px ${30*s}px #00000088`;}}}
    >
      <div style={{position:"absolute",inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,opacity:0.3,zIndex:0}} />
      <div style={{position:"absolute",top:`${-50*s}px`,left:`${-50*s}px`,width:`${200*s}px`,height:`${400*s}px`,background:`linear-gradient(135deg,${type.accent}22 0%,transparent 50%)`,transform:"rotate(-20deg)",zIndex:1}} />
      <div style={{position:"relative",zIndex:2,padding:`${12*s}px ${14*s}px 0`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:`${42*s}px`,fontWeight:900,color:type.accent,lineHeight:1,textShadow:`0 0 ${10*s}px ${type.glow}`}}>{overall}</div>
          <div style={{fontSize:`${13*s}px`,fontWeight:700,color:type.accent,letterSpacing:"0.1em"}}>{player.position||"ST"}</div>
          <div style={{marginTop:`${6*s}px`}}>
            <div style={{width:`${28*s}px`,height:`${28*s}px`,borderRadius:"50%",background:`${type.accent}33`,border:`${1*s}px solid ${type.accent}66`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <span style={{fontSize:`${16*s}px`}}>{getFlagEmoji(player.nationality||"Chile")}</span>
            </div>
            <div style={{width:`${28*s}px`,height:`${20*s}px`,borderRadius:`${3*s}px`,background:`${type.accent}22`,border:`${1*s}px solid ${type.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:`${3*s}px`}}>
              <span style={{fontSize:`${8*s}px`,color:type.accent,fontWeight:700,textAlign:"center",lineHeight:1}}>{(player.club||"Club").substring(0,6)}</span>
            </div>
          </div>
        </div>
        <div style={{background:`${type.accent}22`,border:`${1*s}px solid ${type.accent}55`,borderRadius:`${6*s}px`,padding:`${3*s}px ${7*s}px`,fontSize:`${9*s}px`,fontWeight:700,color:type.accent,letterSpacing:"0.15em"}}>{type.label.toUpperCase()}</div>
      </div>
      <div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"center",height:`${160*s}px`,margin:`${-10*s}px 0 0`}}>
        {player.photoUrl
          ? <img src={player.photoUrl} alt={player.name} style={{height:"100%",objectFit:"contain",filter:`drop-shadow(0 ${4*s}px ${12*s}px #00000099)`}} />
          : <div style={{width:`${130*s}px`,height:`${160*s}px`,display:"flex",alignItems:"center",justifyContent:"center",background:`${type.accent}11`,borderRadius:`${10*s}px ${10*s}px 0 0`}}><div style={{fontSize:`${60*s}px`,opacity:0.4}}>⚽</div></div>
        }
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:`${200*s}px`,height:`${40*s}px`,background:`radial-gradient(ellipse,${type.glow}44 0%,transparent 70%)`,borderRadius:"50%"}} />
      </div>
      <div style={{position:"relative",zIndex:2,textAlign:"center",padding:`${6*s}px ${10*s}px`,borderTop:`${1*s}px solid ${type.accent}33`,borderBottom:`${1*s}px solid ${type.accent}33`,background:`${type.accent}11`}}>
        <div style={{fontSize:`${size==="small"?14*s:20*s}px`,fontWeight:900,color:type.text==="#ffffff"?"#fff":type.accent,letterSpacing:"0.08em",textTransform:"uppercase",textShadow:type.text==="#ffffff"?`0 0 ${8*s}px ${type.glow}88`:"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{player.name||"JUGADOR"}</div>
      </div>
      <div style={{position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:`${4*s}px`,padding:`${10*s}px ${14*s}px`}}>
        {Object.entries(statLabels).map(([key,label])=>(
          <div key={key} style={{display:"flex",flexDirection:"column",alignItems:"center",background:`${type.accent}0d`,borderRadius:`${6*s}px`,padding:`${4*s}px ${2*s}px`}}>
            <div style={{fontSize:`${size==="small"?18*s:22*s}px`,fontWeight:900,color:type.text==="#ffffff"?"#fff":type.bg==="#0a0a1a"?"#fff":type.accent,lineHeight:1}}>{stats[key]||0}</div>
            <div style={{fontSize:`${9*s}px`,fontWeight:700,color:`${type.accent}cc`,letterSpacing:"0.1em"}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{position:"absolute",bottom:`${8*s}px`,left:0,right:0,zIndex:2,display:"flex",justifyContent:"center"}}>
        <div style={{width:`${60*s}px`,height:`${2*s}px`,background:`linear-gradient(90deg,transparent,${type.accent},transparent)`,borderRadius:"99px"}} />
      </div>
    </div>
  );
}

function StatSlider({ label, statKey, value, onChange, color }) {
  return (
    <div style={{marginBottom:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
        <label style={{color:"#aaa",fontSize:"12px",fontWeight:700,letterSpacing:"0.1em",fontFamily:"'Rajdhani',sans-serif"}}>{label}</label>
        <span style={{color,fontSize:"20px",fontWeight:900,fontFamily:"'Rajdhani',sans-serif"}}>{value}</span>
      </div>
      <input type="range" min={1} max={99} value={value} onChange={e=>onChange(statKey,parseInt(e.target.value))} style={{width:"100%",accentColor:color,cursor:"pointer"}} />
    </div>
  );
}

function PlayerForm({ initial, onSave, onCancel }) {
  const [form,setForm] = useState(initial||{name:"",position:"ST",nationality:"Chile",club:"Colo-Colo",age:"",number:"",photoUrl:"",cardType:"",stats:{...defaultStats}});
  const [tab,setTab]   = useState("info");
  const [saving,setSaving] = useState(false);
  const set    = (k,v) => setForm(f=>({...f,[k]:v}));
  const setStat= (k,v) => setForm(f=>({...f,stats:{...f.stats,[k]:v}}));
  const overall = calcOverall(form.stats);
  const autoType= getCardType(overall);
  const inp = {width:"100%",background:"#0d0d1a",border:"1px solid #333",borderRadius:"8px",padding:"10px 14px",color:"#fff",fontSize:"14px",fontFamily:"'Rajdhani',sans-serif",boxSizing:"border-box",outline:"none"};
  const lbl = {color:"#888",fontSize:"11px",fontWeight:700,letterSpacing:"0.1em",marginBottom:"4px",display:"block",fontFamily:"'Rajdhani',sans-serif"};
  const handleSubmit = async () => {
    if(!form.name.trim()) return alert("El nombre es requerido");
    setSaving(true); await new Promise(r=>setTimeout(r,400));
    onSave({...form,cardType:form.cardType||autoType}); setSaving(false);
  };
  return (
    <div style={{display:"flex",gap:"32px",flexWrap:"wrap",alignItems:"flex-start"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
        <FifaCard player={{...form,cardType:form.cardType||autoType}} />
        <div style={{color:"#555",fontSize:"11px",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.1em"}}>VISTA PREVIA EN VIVO</div>
      </div>
      <div style={{flex:1,minWidth:"320px"}}>
        <div style={{display:"flex",gap:"4px",marginBottom:"24px",background:"#0d0d1a",padding:"4px",borderRadius:"10px"}}>
          {[["info","📋 Info"],["stats","📊 Stats"],["card","🎨 Carta"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"8px",borderRadius:"7px",border:"none",cursor:"pointer",background:tab===id?"#6c63ff":"transparent",color:tab===id?"#fff":"#666",fontWeight:700,fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>
        {tab==="info" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>NOMBRE COMPLETO</label><input style={inp} placeholder="Ej: Alexis Sánchez" value={form.name} onChange={e=>set("name",e.target.value)} /></div>
            <div><label style={lbl}>POSICIÓN</label><select style={inp} value={form.position} onChange={e=>set("position",e.target.value)}>{POSITIONS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label style={lbl}>EDAD</label><input style={inp} type="number" min={14} max={50} placeholder="25" value={form.age} onChange={e=>set("age",e.target.value)} /></div>
            <div><label style={lbl}>NACIONALIDAD</label><select style={inp} value={form.nationality} onChange={e=>set("nationality",e.target.value)}>{NATIONALITIES.map(n=><option key={n}>{n}</option>)}</select></div>
            <div><label style={lbl}>CLUB</label><select style={inp} value={form.club} onChange={e=>set("club",e.target.value)}>{CLUBS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>NÚMERO</label><input style={inp} type="number" min={1} max={99} placeholder="10" value={form.number} onChange={e=>set("number",e.target.value)} /></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>URL DE FOTO (opcional)</label><input style={inp} placeholder="https://..." value={form.photoUrl} onChange={e=>set("photoUrl",e.target.value)} /></div>
          </div>
        )}
        {tab==="stats" && (
          <div>
            <div style={{background:"#0d0d1a",borderRadius:"12px",padding:"16px",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #222"}}>
              <span style={{color:"#888",fontFamily:"'Rajdhani',sans-serif",fontSize:"13px",fontWeight:700,letterSpacing:"0.1em"}}>OVERALL CALCULADO</span>
              <span style={{fontSize:"42px",fontWeight:900,fontFamily:"'Rajdhani',sans-serif",color:overall>=87?"#00d4ff":overall>=82?"#f5d769":overall>=75?"#d4a017":overall>=65?"#c9d6df":"#cd853f"}}>{overall}</span>
            </div>
            {Object.entries(statLabels).map(([key,label])=>(
              <StatSlider key={key} label={label} statKey={key} value={form.stats[key]} onChange={setStat} color={statColors[key]} />
            ))}
          </div>
        )}
        {tab==="card" && (
          <div>
            <label style={lbl}>TIPO DE CARTA</label>
            <p style={{color:"#555",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",marginBottom:"16px"}}>Auto-asignado: <span style={{color:"#6c63ff"}}>{CARD_TYPES[autoType]?.label}</span></p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {[["","Auto (según overall)"],...Object.entries(CARD_TYPES).map(([k,v])=>[k,v.label])].map(([key,label])=>(
                <button key={key} onClick={()=>set("cardType",key)} style={{padding:"12px",borderRadius:"10px",border:`2px solid ${(form.cardType||"")===key?"#6c63ff":"#222"}`,background:(form.cardType||"")===key?"#6c63ff22":"#0d0d1a",color:(form.cardType||"")===key?"#fff":"#888",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",transition:"all 0.2s"}}>{label}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:"12px",marginTop:"28px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"14px",borderRadius:"10px",border:"1px solid #333",background:"transparent",color:"#888",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{flex:2,padding:"14px",borderRadius:"10px",border:"none",background:saving?"#333":"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:saving?"wait":"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:"16px",letterSpacing:"0.1em",boxShadow:saving?"none":"0 4px 20px #6c63ff55",transition:"all 0.2s"}}>
            {saving?"GUARDANDO...":(initial?"ACTUALIZAR JUGADOR":"CREAR JUGADOR")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintView({ players, onClose }) {
  const toPrint = players.filter(p=>p._selected).length>0?players.filter(p=>p._selected):players;
  return (
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:1000,overflowY:"auto"}}>
      <div style={{padding:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #eee"}} className="no-print">
        <h2 style={{margin:0,fontFamily:"'Rajdhani',sans-serif",color:"#1a1a2e",fontWeight:900}}>Vista Impresión — {toPrint.length} carta(s)</h2>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={()=>window.print()} style={{padding:"10px 24px",borderRadius:"8px",border:"none",background:"#6c63ff",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>IMPRIMIR</button>
          <button onClick={onClose} style={{padding:"10px 24px",borderRadius:"8px",border:"1px solid #ddd",background:"transparent",color:"#666",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>CERRAR</button>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"20px",padding:"30px",justifyContent:"center",background:"#f5f5f5",minHeight:"calc(100vh - 70px)"}}>
        {toPrint.map(p=><FifaCard key={p.id} player={p} />)}
      </div>
      <style>{`@media print{.no-print{display:none!important;}body{background:white;}}`}</style>
    </div>
  );
}

function PlayerDetail({ player, onEdit, onDelete, onClose, onPrint }) {
  const overall = calcOverall(player.stats);
  const typeKey  = player.cardType||getCardType(overall);
  const type     = CARD_TYPES[typeKey]||CARD_TYPES.gold_rare;
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d0d1a",border:`1px solid ${type.accent}44`,borderRadius:"20px",padding:"32px",maxWidth:"800px",width:"100%",display:"flex",gap:"32px",flexWrap:"wrap",justifyContent:"center",boxShadow:`0 0 60px ${type.glow}33`}}>
        <FifaCard player={player} />
        <div style={{flex:1,minWidth:"240px"}}>
          <h2 style={{margin:"0 0 6px",fontFamily:"'Rajdhani',sans-serif",color:"#fff",fontSize:"28px",fontWeight:900}}>{player.name}</h2>
          <p style={{color:type.accent,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,margin:"0 0 24px",letterSpacing:"0.1em"}}>{player.position} · {player.club}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"24px"}}>
            {[["Edad",player.age||"—"],["Nac.",player.nationality],["Número",player.number?`#${player.number}`:"—"],["Overall",overall],["Tipo carta",CARD_TYPES[typeKey]?.label],["Creado",new Date(player.createdAt).toLocaleDateString("es-CL")]].map(([k,v])=>(
              <div key={k} style={{background:"#1a1a2e",borderRadius:"10px",padding:"10px 14px",border:"1px solid #222"}}>
                <div style={{color:"#555",fontSize:"10px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.1em"}}>{k}</div>
                <div style={{color:"#fff",fontSize:"16px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <button onClick={onEdit} style={{padding:"12px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>✏️ EDITAR</button>
            <button onClick={onPrint} style={{padding:"12px",borderRadius:"10px",border:"1px solid #6c63ff55",background:"#6c63ff22",color:"#6c63ff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>🖨️ IMPRIMIR</button>
            <button onClick={onDelete} style={{padding:"12px",borderRadius:"10px",border:"1px solid #ff4d4d55",background:"#ff4d4d11",color:"#ff4d4d",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>🗑️ ELIMINAR</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluationGuide() {
  const [active,setActive] = useState("pace");
  const proto = PROTOCOLS.find(p=>p.key===active);
  return (
    <div style={{maxWidth:"1100px",margin:"0 auto"}}>
      <div style={{marginBottom:"36px",position:"relative",overflow:"hidden",borderRadius:"20px",background:"linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 100%)",border:"1px solid #1f1f3a",padding:"36px 40px"}}>
        <div style={{position:"absolute",top:"-40px",right:"-40px",width:"220px",height:"220px",borderRadius:"50%",background:"radial-gradient(circle,#6c63ff22 0%,transparent 70%)"}} />
        <div style={{position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"12px"}}>
            <span style={{fontSize:"32px"}}>📋</span>
            <div>
              <h1 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:"36px",letterSpacing:"0.2em",color:"#fff",lineHeight:1}}>PROTOCOLO DE EVALUACIÓN EN CANCHA</h1>
              <p style={{margin:0,color:"#555",fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.15em"}}>GUÍA OFICIAL DE MEDICIÓN — CENTRO DE EVALUACIÓN FIFA CARD</p>
            </div>
          </div>
          <p style={{color:"#888",fontSize:"14px",fontFamily:"'Rajdhani',sans-serif",maxWidth:"700px",lineHeight:1.8,margin:0}}>
            Cada estadística se obtiene mediante pruebas estandarizadas realizadas por evaluadores certificados del centro. Los puntajes se calculan según los resultados obtenidos y se convierten a la escala FIFA (1–99). El evaluador registra los resultados en el formulario y el sistema calcula el puntaje final automáticamente.
          </p>
        </div>
      </div>

      <div style={{display:"flex",gap:"8px",marginBottom:"28px",flexWrap:"wrap"}}>
        {PROTOCOLS.map(p=>(
          <button key={p.key} onClick={()=>setActive(p.key)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 18px",borderRadius:"30px",border:`2px solid ${active===p.key?p.color:"#1f1f3a"}`,background:active===p.key?`${p.color}22`:"#0d0d1a",color:active===p.key?p.color:"#555",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"14px",letterSpacing:"0.06em",transition:"all 0.2s",boxShadow:active===p.key?`0 0 16px ${p.color}33`:"none"}}>
            <span>{p.icon}</span><span>{p.abbr}</span><span style={{fontSize:"11px",opacity:0.7,display:"none"}}>{p.label}</span>
            <span style={{fontSize:"12px",opacity:active===p.key?1:0.6}}>{p.label}</span>
          </button>
        ))}
      </div>

      {proto && (
        <div style={{animation:"fadeIn 0.3s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:"20px",marginBottom:"28px",padding:"24px 28px",background:`linear-gradient(135deg,${proto.color}12,#0d0d1a)`,borderRadius:"16px",border:`1px solid ${proto.color}33`}}>
            <div style={{fontSize:"52px"}}>{proto.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"32px",color:proto.color,letterSpacing:"0.2em"}}>{proto.abbr}</span>
                <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:"18px",color:"#aaa",fontWeight:700,letterSpacing:"0.1em"}}>— {proto.label}</span>
              </div>
              <p style={{color:"#888",fontSize:"14px",fontFamily:"'Rajdhani',sans-serif",margin:0,lineHeight:1.7}}>{proto.description}</p>
            </div>
          </div>

          <div style={{marginBottom:"28px",padding:"20px 24px",background:"#0d0d1a",borderRadius:"14px",border:"1px solid #1f1f3a"}}>
            <h3 style={{margin:"0 0 14px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"0.2em",color:"#aaa"}}>🧰 MATERIAL NECESARIO</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {proto.equipment.map((eq,i)=>(
                <div key={i} style={{padding:"6px 14px",borderRadius:"20px",background:"#1a1a2e",border:"1px solid #2a2a4a",color:"#aaa",fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>✓ {eq}</div>
              ))}
            </div>
          </div>

          {proto.tests.map((test,ti)=>(
            <div key={ti} style={{marginBottom:"24px",background:"#0d0d1a",borderRadius:"16px",border:"1px solid #1f1f3a",overflow:"hidden"}}>
              <div style={{padding:"18px 24px",background:`${proto.color}0e`,borderBottom:"1px solid #1f1f3a",display:"flex",alignItems:"center",gap:"14px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",background:proto.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:900,color:"#000",fontFamily:"'Bebas Neue',sans-serif",flexShrink:0}}>{ti+1}</div>
                <div>
                  <h3 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:"20px",letterSpacing:"0.15em",color:proto.color}}>{test.name}</h3>
                  <p style={{margin:0,color:"#666",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif"}}>{test.objective}</p>
                </div>
              </div>
              <div style={{padding:"24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
                <div>
                  {[["📐 MONTAJE DEL TEST",test.setup],["▶️ EJECUCIÓN",test.execution],["🔁 INTENTOS Y CRITERIO",`${test.attempts} intento(s) — ${test.best}`]].map(([lbl,txt])=>(
                    <div key={lbl} style={{marginBottom:"16px"}}>
                      <div style={{fontSize:"10px",fontWeight:700,color:proto.color,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"6px"}}>{lbl}</div>
                      <p style={{color:"#bbb",fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",lineHeight:1.75,margin:0,background:"#111",borderRadius:"8px",padding:"12px 14px",border:"1px solid #1a1a2e"}}>{txt}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:"10px",fontWeight:700,color:proto.color,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"10px"}}>📊 TABLA DE PUNTAJE FIFA</div>
                  <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #1a1a2e"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 56px 1fr",padding:"7px 14px",background:"#111",borderBottom:"1px solid #1a1a2e"}}>
                      <div style={{color:"#444",fontSize:"10px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.1em"}}>RESULTADO</div>
                      <div style={{color:"#444",fontSize:"10px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.1em",textAlign:"center"}}>PTOS</div>
                      <div style={{color:"#444",fontSize:"10px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.1em",textAlign:"right"}}>NIVEL</div>
                    </div>
                    {test.scoring.map((row,ri)=>{
                      const pNum=parseInt(row.pts);
                      const bColor=pNum>=90?"#00d4ff":pNum>=74?"#f5d769":pNum>=55?"#00ff88":pNum>=35?"#ffd93d":"#ff6b6b";
                      return (
                        <div key={ri} style={{display:"grid",gridTemplateColumns:"1fr 56px 1fr",alignItems:"center",padding:"10px 14px",background:ri%2===0?"#0d0d1a":"#0a0a16",borderBottom:ri<test.scoring.length-1?"1px solid #111":"none",gap:"8px"}}>
                          <div style={{color:"#ccc",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{row.range}</div>
                          <div style={{textAlign:"center",background:`${bColor}22`,border:`1px solid ${bColor}44`,borderRadius:"6px",padding:"2px 0"}}>
                            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"15px",color:bColor}}>{row.pts}</span>
                          </div>
                          <div style={{textAlign:"right",color:"#666",fontSize:"11px",fontFamily:"'Rajdhani',sans-serif",fontStyle:"italic"}}>{row.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{padding:"20px 28px",background:`linear-gradient(135deg,${proto.color}12,#0d0d1a)`,borderRadius:"14px",border:`1px solid ${proto.color}44`,display:"flex",alignItems:"flex-start",gap:"16px",marginBottom:"24px"}}>
            <span style={{fontSize:"24px",marginTop:"2px"}}>🧮</span>
            <div>
              <div style={{fontSize:"10px",fontWeight:700,color:proto.color,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"8px"}}>FÓRMULA DE CÁLCULO FINAL</div>
              <div style={{color:"#fff",fontSize:"15px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,lineHeight:1.6}}>{proto.formula}</div>
              <div style={{color:"#555",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",marginTop:"6px"}}>El evaluador registra los resultados brutos y el sistema calcula el puntaje en escala 1–99 automáticamente.</div>
            </div>
          </div>

          <div style={{padding:"18px 24px",background:"#0d0d1a",borderRadius:"14px",border:"1px solid #1f1f3a"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:"#444",letterSpacing:"0.2em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"12px"}}>REFERENCIA — TIPO DE CARTA SEGÚN PUNTAJE OVERALL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {[["10–41","Bronze","#cd853f"],["42–64","Silver","#c9d6df"],["65–81","Gold","#d4a017"],["82–86","Gold Rare","#f5d769"],["87–99","TOTY / Especial","#00d4ff"]].map(([range,label,color])=>(
                <div key={range} style={{padding:"8px 18px",borderRadius:"24px",background:`${color}18`,border:`1px solid ${color}44`,display:"flex",gap:"10px",alignItems:"center"}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",color,letterSpacing:"0.05em"}}>{range}</span>
                  <span style={{fontSize:"12px",color:"#888",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ players, onNew, onPrintAll, setDetailPlayer }) {
  const [search,setSearch] = useState("");
  const filtered = players.filter(p=>
    p.name?.toLowerCase().includes(search.toLowerCase())||
    p.position?.toLowerCase().includes(search.toLowerCase())||
    p.club?.toLowerCase().includes(search.toLowerCase())
  );
  const stats = {
    total:players.length,
    avgOverall:players.length?Math.round(players.reduce((a,p)=>a+calcOverall(p.stats),0)/players.length):0,
    gold:players.filter(p=>["gold_rare","gold_nonrare","toty","inform","hero"].includes(p.cardType||getCardType(calcOverall(p.stats)))).length,
    positions:[...new Set(players.map(p=>p.position))].length,
  };
  return (
    <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"32px"}}>
        {[["JUGADORES",stats.total,"#6c63ff","👥"],["PROMEDIO",stats.avgOverall,"#f5d769","⭐"],["CARTAS ORO",stats.gold,"#d4a017","🥇"],["POSICIONES",stats.positions,"#00d4ff","📍"]].map(([label,val,color,icon])=>(
          <div key={label} style={{background:"#0d0d1a",border:`1px solid ${color}33`,borderRadius:"14px",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#555",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"6px"}}>{label}</div>
              <div style={{color,fontSize:"36px",fontWeight:900,fontFamily:"'Bebas Neue',sans-serif"}}>{val}</div>
            </div>
            <div style={{fontSize:"28px",opacity:0.5}}>{icon}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:"12px",marginBottom:"24px"}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",color:"#444",fontSize:"16px"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, posición o club..." style={{width:"100%",background:"#0d0d1a",border:"1px solid #222",borderRadius:"10px",padding:"12px 16px 12px 44px",color:"#fff",fontSize:"15px",fontFamily:"'Rajdhani',sans-serif",outline:"none",boxSizing:"border-box"}} />
        </div>
        <button onClick={onPrintAll} disabled={!players.length} style={{padding:"12px 20px",borderRadius:"10px",border:"1px solid #333",background:"transparent",color:players.length?"#aaa":"#333",cursor:players.length?"pointer":"default",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",whiteSpace:"nowrap"}}>🖨️ IMPRIMIR TODAS</button>
        <button onClick={onNew} style={{padding:"12px 24px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",boxShadow:"0 2px 12px #6c63ff44",whiteSpace:"nowrap"}}>+ NUEVO JUGADOR</button>
      </div>
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"80px 0",color:"#333"}}>
          <div style={{fontSize:"64px",marginBottom:"16px"}}>⚽</div>
          <div style={{fontSize:"20px",fontWeight:700,color:"#444",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"0.2em"}}>{players.length===0?"SIN JUGADORES AÚN":"SIN RESULTADOS"}</div>
          <div style={{color:"#333",marginTop:"8px",fontSize:"14px",fontFamily:"'Rajdhani',sans-serif"}}>{players.length===0?"Crea tu primer jugador con el botón de arriba":"Prueba con otra búsqueda"}</div>
        </div>
      ):(
        <div style={{display:"flex",flexWrap:"wrap",gap:"20px"}}>
          {filtered.map(p=><FifaCard key={p.id} player={p} size="small" onClick={()=>setDetailPlayer(p)} />)}
        </div>
      )}
    </>
  );
}

export default function App() {
  const [page,setPage]           = useState("dashboard");
  const [players,setPlayers]     = useState([]);
  const [editPlayer,setEditPlayer] = useState(null);
  const [detailPlayer,setDetailPlayer] = useState(null);
  const [printPlayers,setPrintPlayers] = useState(null);

  useEffect(()=>{ setPlayers(db.getAll()); },[]);
  const reload = () => setPlayers(db.getAll());

  const handleSave = (data) => {
    if(editPlayer) db.update(editPlayer.id,data); else db.add(data);
    reload(); setPage("dashboard"); setEditPlayer(null);
  };

  const isForm = page==="form" || editPlayer;

  return (
    <div style={{minHeight:"100vh",background:"#070714",color:"#fff",fontFamily:"'Rajdhani',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#070714;}
        ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#0d0d1a;}::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:3px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        select option{background:#1a1a2e;color:#fff;}
      `}</style>

      <header style={{background:"#0d0d1a",borderBottom:"1px solid #1a1a2e",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",position:"sticky",top:0,zIndex:50,gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",flexShrink:0}}>
          <div style={{width:"36px",height:"36px",background:"linear-gradient(135deg,#6c63ff,#00d4ff)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>⚽</div>
          <div>
            <div style={{fontSize:"18px",fontWeight:900,letterSpacing:"0.12em",fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>CARD CENTER</div>
            <div style={{fontSize:"10px",color:"#555",letterSpacing:"0.15em"}}>SISTEMA DE EVALUACIÓN FIFA</div>
          </div>
        </div>
        <nav style={{display:"flex",gap:"4px"}}>
          {[["dashboard","⚽ Jugadores"],["guide","📋 Protocolo de Evaluación"]].map(([id,label])=>(
            <button key={id} onClick={()=>{setPage(id);setEditPlayer(null);}} style={{padding:"8px 18px",borderRadius:"8px",border:"none",background:page===id&&!isForm?"#6c63ff22":"transparent",color:page===id&&!isForm?"#6c63ff":"#666",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",letterSpacing:"0.06em",borderBottom:page===id&&!isForm?"2px solid #6c63ff":"2px solid transparent",transition:"all 0.2s",whiteSpace:"nowrap"}}>{label}</button>
          ))}
        </nav>
        <div style={{flexShrink:0}}>
          {isForm && (
            <button onClick={()=>{setPage("dashboard");setEditPlayer(null);}} style={{padding:"8px 18px",borderRadius:"8px",border:"1px solid #333",background:"transparent",color:"#aaa",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px"}}>← Volver</button>
          )}
        </div>
      </header>

      <main style={{padding:"32px",maxWidth:"1400px",margin:"0 auto"}}>
        {page==="dashboard"&&!isForm && (
          <Dashboard players={players} onNew={()=>{setEditPlayer(null);setPage("form");}} onPrintAll={()=>setPrintPlayers(players)} setDetailPlayer={setDetailPlayer} />
        )}
        {isForm && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"32px",letterSpacing:"0.2em",marginBottom:"32px"}}>{editPlayer?"✏️ EDITAR JUGADOR":"➕ NUEVO JUGADOR"}</h1>
            <PlayerForm initial={editPlayer} onSave={handleSave} onCancel={()=>{setPage("dashboard");setEditPlayer(null);}} />
          </div>
        )}
        {page==="guide"&&!isForm && (
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <EvaluationGuide />
          </div>
        )}
      </main>

      {printPlayers && <PrintView players={printPlayers} onClose={()=>setPrintPlayers(null)} />}
      {detailPlayer && (
        <PlayerDetail
          player={detailPlayer}
          onClose={()=>setDetailPlayer(null)}
          onEdit={()=>{setEditPlayer(detailPlayer);setDetailPlayer(null);setPage("form");}}
          onDelete={()=>{if(!confirm("¿Eliminar jugador?"))return;db.delete(detailPlayer.id);reload();setDetailPlayer(null);}}
          onPrint={()=>{setPrintPlayers([detailPlayer]);setDetailPlayer(null);}}
        />
      )}
    </div>
  );
}
