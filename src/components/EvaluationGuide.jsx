import { useState } from "react";
import { PROTOCOLS } from "../constants/protocols";

function ScoringTable({ scoring, color }) {
  return (
    <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #1a1a2e"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 56px 1fr",padding:"7px 14px",background:"#111",borderBottom:"1px solid #1a1a2e"}}>
        {["RESULTADO","PTOS","NIVEL"].map((h, i) => (
          <div key={h} style={{color:"#444",fontSize:"10px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:"0.1em",textAlign:i===1?"center":i===2?"right":"left"}}>{h}</div>
        ))}
      </div>
      {scoring.map((row, ri) => {
        const pNum   = parseInt(row.pts);
        const bColor = pNum>=90?"#00d4ff":pNum>=74?"#f5d769":pNum>=55?"#00ff88":pNum>=35?"#ffd93d":"#ff6b6b";
        return (
          <div key={ri} style={{display:"grid",gridTemplateColumns:"1fr 56px 1fr",alignItems:"center",padding:"10px 14px",background:ri%2===0?"#0d0d1a":"#0a0a16",borderBottom:ri<scoring.length-1?"1px solid #111":"none",gap:"8px"}}>
            <div style={{color:"#ccc",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{row.range}</div>
            <div style={{textAlign:"center",background:`${bColor}22`,border:`1px solid ${bColor}44`,borderRadius:"6px",padding:"2px 0"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"15px",color:bColor}}>{row.pts}</span>
            </div>
            <div style={{textAlign:"right",color:"#666",fontSize:"11px",fontFamily:"'Rajdhani',sans-serif",fontStyle:"italic"}}>{row.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function TestCard({ test, index, color }) {
  return (
    <div style={{marginBottom:"24px",background:"#0d0d1a",borderRadius:"16px",border:"1px solid #1f1f3a",overflow:"hidden"}}>
      <div style={{padding:"18px 24px",background:`${color}0e`,borderBottom:"1px solid #1f1f3a",display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{width:"32px",height:"32px",borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:900,color:"#000",fontFamily:"'Bebas Neue',sans-serif",flexShrink:0}}>{index + 1}</div>
        <div>
          <h3 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:"20px",letterSpacing:"0.15em",color}}>{test.name}</h3>
          <p style={{margin:0,color:"#666",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif"}}>{test.objective}</p>
        </div>
      </div>
      <div style={{padding:"24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
        <div>
          {[
            ["📐 MONTAJE DEL TEST",     test.setup],
            ["▶️ EJECUCIÓN",            test.execution],
            ["🔁 INTENTOS Y CRITERIO", `${test.attempts} intento(s) — ${test.best}`],
          ].map(([label, text]) => (
            <div key={label} style={{marginBottom:"16px"}}>
              <div style={{fontSize:"10px",fontWeight:700,color,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"6px"}}>{label}</div>
              <p style={{color:"#bbb",fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",lineHeight:1.75,margin:0,background:"#111",borderRadius:"8px",padding:"12px 14px",border:"1px solid #1a1a2e"}}>{text}</p>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:"10px",fontWeight:700,color,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"10px"}}>📊 TABLA DE PUNTAJE FIFA</div>
          <ScoringTable scoring={test.scoring} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function EvaluationGuide() {
  const [active, setActive] = useState("pace");
  const proto = PROTOCOLS.find(p => p.key === active);

  return (
    <div style={{maxWidth:"1100px",margin:"0 auto"}}>
      {/* Header */}
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
            Cada estadística se obtiene mediante pruebas estandarizadas realizadas por evaluadores certificados del centro. Los puntajes se calculan según los resultados obtenidos y se convierten a la escala FIFA (1–99).
          </p>
        </div>
      </div>

      {/* Stat tabs */}
      <div style={{display:"flex",gap:"8px",marginBottom:"28px",flexWrap:"wrap"}}>
        {PROTOCOLS.map(p => (
          <button key={p.key} onClick={() => setActive(p.key)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 18px",borderRadius:"30px",border:`2px solid ${active===p.key?p.color:"#1f1f3a"}`,background:active===p.key?`${p.color}22`:"#0d0d1a",color:active===p.key?p.color:"#555",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"14px",letterSpacing:"0.06em",transition:"all 0.2s",boxShadow:active===p.key?`0 0 16px ${p.color}33`:"none"}}>
            <span>{p.icon}</span><span>{p.abbr}</span>
            <span style={{fontSize:"12px",opacity:active===p.key?1:0.6}}>{p.label}</span>
          </button>
        ))}
      </div>

      {proto && (
        <div style={{animation:"fadeIn 0.3s ease"}}>
          {/* Stat header */}
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

          {/* Equipment */}
          <div style={{marginBottom:"28px",padding:"20px 24px",background:"#0d0d1a",borderRadius:"14px",border:"1px solid #1f1f3a"}}>
            <h3 style={{margin:"0 0 14px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"0.2em",color:"#aaa"}}>🧰 MATERIAL NECESARIO</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {proto.equipment.map((eq, i) => (
                <div key={i} style={{padding:"6px 14px",borderRadius:"20px",background:"#1a1a2e",border:"1px solid #2a2a4a",color:"#aaa",fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>✓ {eq}</div>
              ))}
            </div>
          </div>

          {/* Tests */}
          {proto.tests.map((test, ti) => (
            <TestCard key={ti} test={test} index={ti} color={proto.color} />
          ))}

          {/* Formula */}
          <div style={{padding:"20px 28px",background:`linear-gradient(135deg,${proto.color}12,#0d0d1a)`,borderRadius:"14px",border:`1px solid ${proto.color}44`,display:"flex",alignItems:"flex-start",gap:"16px",marginBottom:"24px"}}>
            <span style={{fontSize:"24px",marginTop:"2px"}}>🧮</span>
            <div>
              <div style={{fontSize:"10px",fontWeight:700,color:proto.color,letterSpacing:"0.15em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"8px"}}>FÓRMULA DE CÁLCULO FINAL</div>
              <div style={{color:"#fff",fontSize:"15px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,lineHeight:1.6}}>{proto.formula}</div>
              <div style={{color:"#555",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",marginTop:"6px"}}>El evaluador registra los resultados brutos y el sistema calcula el puntaje en escala 1–99 automáticamente.</div>
            </div>
          </div>

          {/* Card range reference */}
          <div style={{padding:"18px 24px",background:"#0d0d1a",borderRadius:"14px",border:"1px solid #1f1f3a"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:"#444",letterSpacing:"0.2em",fontFamily:"'Rajdhani',sans-serif",marginBottom:"12px"}}>REFERENCIA — TIPO DE CARTA SEGÚN PUNTAJE OVERALL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {[["10–41","Bronze","#cd853f"],["42–64","Silver","#c9d6df"],["65–81","Gold","#d4a017"],["82–86","Gold Rare","#f5d769"],["87–99","TOTY / Especial","#00d4ff"]].map(([range, label, color]) => (
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
