import { useState } from "react";
import { PROTOCOLS } from "../constants/protocols";
import { AGE_CATEGORIES } from "../constants/ageCategories";

function ScoringTable({ scoring, activeCat, color }) {
  const rows = scoring[activeCat] || scoring["senior"] || [];
  return (
    <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #ffffff12"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 56px 1fr",padding:"7px 14px",background:"#161626",borderBottom:"1px solid #ffffff12"}}>
        {["RESULTADO","PTOS","NIVEL"].map((h, i) => (
          <div key={h} style={{color:"#5A5A6E",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.12em",textAlign:i===1?"center":i===2?"right":"left"}}>{h}</div>
        ))}
      </div>
      {rows.map((row, ri) => {
        const pNum   = parseInt(row.pts);
        const bColor = pNum>=90?"#00E5FF":pNum>=74?"#f5d769":pNum>=55?"#00FF94":pNum>=35?"#ffd93d":"#ff6b6b";
        return (
          <div key={ri} style={{display:"grid",gridTemplateColumns:"1fr 56px 1fr",alignItems:"center",padding:"10px 14px",background:ri%2===0?"#0F0F1A":"#0a0a12",borderBottom:ri<rows.length-1?"1px solid #ffffff08":"none",gap:"8px"}}>
            <div style={{color:"#ECECF5",fontSize:"12px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:500}}>{row.range}</div>
            <div style={{textAlign:"center",background:`${bColor}22`,border:`1px solid ${bColor}44`,borderRadius:"6px",padding:"2px 0"}}>
              <span style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"15px",color:bColor}}>{row.pts}</span>
            </div>
            <div style={{textAlign:"right",color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",fontStyle:"italic"}}>{row.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function TestCard({ test, index, color, activeCat }) {
  return (
    <div style={{marginBottom:"24px",background:"#0F0F1A",borderRadius:"16px",border:"1px solid #ffffff12",overflow:"hidden"}}>
      <div style={{padding:"18px 24px",background:`${color}0e`,borderBottom:"1px solid #ffffff12",display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{width:"32px",height:"32px",borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:900,color:"#07070D",fontFamily:"'Archivo',sans-serif",flexShrink:0}}>{index + 1}</div>
        <div>
          <h3 style={{margin:0,fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"20px",letterSpacing:"0.04em",color}}>{test.name}</h3>
          <p style={{margin:0,color:"#5A5A6E",fontSize:"12px",fontFamily:"'Space Grotesk',sans-serif"}}>{test.objective} · <span style={{color:"#5A5A6E"}}>Unidad: </span><span style={{color}}>{test.unit}</span></p>
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
              <div style={{fontSize:"10px",fontWeight:600,color,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"6px"}}>{label}</div>
              <p style={{color:"#ECECF5",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.75,margin:0,background:"#161626",borderRadius:"8px",padding:"12px 14px",border:"1px solid #ffffff12"}}>{text}</p>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:"10px",fontWeight:600,color,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"10px"}}>📊 TABLA DE PUNTAJE FIFA</div>
          <ScoringTable scoring={test.scoring} activeCat={activeCat} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function EvaluationGuide() {
  const [active,    setActive]    = useState("pace");
  const [activeCat, setActiveCat] = useState("senior");
  const proto = PROTOCOLS.find(p => p.key === active);
  const cat   = AGE_CATEGORIES.find(c => c.key === activeCat);

  return (
    <div style={{maxWidth:"1100px",margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:"36px",position:"relative",overflow:"hidden",borderRadius:"20px",background:"linear-gradient(135deg,#0F0F1A 0%,#161626 100%)",border:"1px solid #ffffff12",padding:"36px 40px"}}>
        <div style={{position:"absolute",top:"-40px",right:"-40px",width:"220px",height:"220px",borderRadius:"50%",background:"radial-gradient(circle,#00FF9415 0%,transparent 70%)"}} />
        <div style={{position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"12px"}}>
            <span style={{fontSize:"32px"}}>📋</span>
            <div>
              <div style={{fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.3em",fontSize:"11px",color:"#00FF94",marginBottom:"4px"}}>MODO CRACK</div>
              <h1 style={{margin:0,fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"32px",letterSpacing:"-0.01em",color:"#ECECF5",lineHeight:1}}>CÓMO SE DESBLOQUEAN LAS STATS</h1>
              <p style={{margin:"4px 0 0",color:"#5A5A6E",fontSize:"12px",fontFamily:"'Chakra Petch',sans-serif",letterSpacing:"0.12em"}}>GUÍA OFICIAL · PUNTAJES DIFERENCIADOS POR CATEGORÍA DE EDAD</p>
            </div>
          </div>
          <p style={{color:"#5A5A6E",fontSize:"14px",fontFamily:"'Space Grotesk',sans-serif",maxWidth:"700px",lineHeight:1.8,margin:0}}>
            Cada stat se obtiene mediante pruebas estandarizadas. Los umbrales de puntaje varían según la categoría etaria del jugador para garantizar una evaluación justa y comparable.
          </p>
        </div>
      </div>

      {/* Stat tabs */}
      <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
        {PROTOCOLS.map(p => (
          <button key={p.key} onClick={() => setActive(p.key)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 18px",borderRadius:"30px",border:`2px solid ${active===p.key?p.color:"#ffffff12"}`,background:active===p.key?`${p.color}22`:"#0F0F1A",color:active===p.key?p.color:"#5A5A6E",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"13px",letterSpacing:"0.06em",transition:"all 0.2s",boxShadow:active===p.key?`0 0 16px ${p.color}33`:"none"}}>
            <span>{p.icon}</span><span>{p.abbr}</span>
            <span style={{fontSize:"12px",opacity:active===p.key?1:0.6}}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Category selector */}
      <div style={{display:"flex",gap:"6px",marginBottom:"28px",flexWrap:"wrap",padding:"12px 16px",background:"#0F0F1A",borderRadius:"14px",border:"1px solid #ffffff12",alignItems:"center"}}>
        <span style={{color:"#5A5A6E",fontSize:"10px",fontWeight:600,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginRight:"6px",flexShrink:0}}>CATEGORÍA:</span>
        {AGE_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setActiveCat(c.key)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"5px 14px",borderRadius:"20px",border:`2px solid ${activeCat===c.key?c.color:"#ffffff12"}`,background:activeCat===c.key?`${c.color}22`:"transparent",color:activeCat===c.key?c.color:"#5A5A6E",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",transition:"all 0.2s"}}>
            <span>{c.icon}</span><span>{c.label}</span>
            <span style={{fontSize:"10px",opacity:0.6,fontWeight:400}}>({c.born})</span>
          </button>
        ))}
      </div>

      {proto && cat && (
        <div style={{animation:"fadeIn 0.3s ease"}}>
          {/* Stat header */}
          <div style={{display:"flex",alignItems:"center",gap:"20px",marginBottom:"28px",padding:"24px 28px",background:`linear-gradient(135deg,${proto.color}12,#0F0F1A)`,borderRadius:"16px",border:`1px solid ${proto.color}33`}}>
            <div style={{fontSize:"52px"}}>{proto.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px",flexWrap:"wrap"}}>
                <span style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"32px",color:proto.color,letterSpacing:"0.04em"}}>{proto.abbr}</span>
                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"18px",color:"#ECECF5",fontWeight:600}}>— {proto.label}</span>
                <span style={{padding:"4px 12px",borderRadius:"20px",background:`${cat.color}22`,border:`1px solid ${cat.color}44`,color:cat.color,fontSize:"12px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600}}>{cat.icon} {cat.label} · {cat.born}</span>
              </div>
              <p style={{color:"#5A5A6E",fontSize:"14px",fontFamily:"'Space Grotesk',sans-serif",margin:0,lineHeight:1.7}}>{proto.description}</p>
            </div>
          </div>

          {/* Equipment */}
          <div style={{marginBottom:"28px",padding:"20px 24px",background:"#0F0F1A",borderRadius:"14px",border:"1px solid #ffffff12"}}>
            <h3 style={{margin:"0 0 14px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",letterSpacing:"0.2em",color:"#5A5A6E"}}>🧰 MATERIAL NECESARIO</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {proto.equipment.map((eq, i) => (
                <div key={i} style={{padding:"6px 14px",borderRadius:"20px",background:"#161626",border:"1px solid #ffffff12",color:"#ECECF5",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:500}}>✓ {eq}</div>
              ))}
            </div>
          </div>

          {/* Tests */}
          {proto.tests.map((test, ti) => (
            <TestCard key={ti} test={test} index={ti} color={proto.color} activeCat={activeCat} />
          ))}

          {/* Formula */}
          <div style={{padding:"20px 28px",background:`linear-gradient(135deg,${proto.color}12,#0F0F1A)`,borderRadius:"14px",border:`1px solid ${proto.color}44`,display:"flex",alignItems:"flex-start",gap:"16px",marginBottom:"24px"}}>
            <span style={{fontSize:"24px",marginTop:"2px"}}>🧮</span>
            <div>
              <div style={{fontSize:"10px",fontWeight:600,color:proto.color,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"8px"}}>FÓRMULA DE CÁLCULO FINAL</div>
              <div style={{color:"#ECECF5",fontSize:"15px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,lineHeight:1.6}}>{proto.formula}</div>
              <div style={{color:"#5A5A6E",fontSize:"12px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"6px"}}>El evaluador registra los resultados brutos y el sistema calcula el puntaje en escala 1–99 automáticamente.</div>
            </div>
          </div>

          {/* Card range reference */}
          <div style={{padding:"18px 24px",background:"#0F0F1A",borderRadius:"14px",border:"1px solid #ffffff12"}}>
            <div style={{fontSize:"10px",fontWeight:600,color:"#5A5A6E",letterSpacing:"0.2em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"12px"}}>REFERENCIA — TIPO DE CARTA SEGÚN OVERALL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
              {[["10–41","Bronze","#cd853f"],["42–64","Silver","#c9d6df"],["65–81","Gold","#d4a017"],["82–86","Gold Rare","#f5d769"],["87–99","TOTY / Especial","#00d4ff"]].map(([range, label, color]) => (
                <div key={range} style={{padding:"8px 18px",borderRadius:"24px",background:`${color}18`,border:`1px solid ${color}44`,display:"flex",gap:"10px",alignItems:"center"}}>
                  <span style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"16px",color,letterSpacing:"0.02em"}}>{range}</span>
                  <span style={{fontSize:"12px",color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif",fontWeight:500}}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
