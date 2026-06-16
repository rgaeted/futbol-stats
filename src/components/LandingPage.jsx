export default function LandingPage({ onShowAuth }) {
  const steps = [
    {
      num: "01",
      icon: "📝",
      title: "Regístrate",
      desc: "Crea tu cuenta con tu email. Es gratis y toma menos de un minuto.",
      color: "#00FF94",
    },
    {
      num: "02",
      icon: "🏃",
      title: "Asiste a la evaluación",
      desc: "Preséntate en el punto de evaluación. Vas a correr, saltar, patear y demostrar todo tu talento en una serie de pruebas físicas y técnicas.",
      color: "#00E5FF",
    },
    {
      num: "03",
      icon: "📊",
      title: "El sistema calcula tus stats",
      desc: "Tus resultados se convierten automáticamente en atributos: velocidad, disparo, pase, regate, defensa y físico.",
      color: "#7B5BFF",
    },
    {
      num: "04",
      icon: "🃏",
      title: "Tu carta queda lista",
      desc: "Recibirás tu carta FIFA personalizada con tu foto, tu overall y todos tus stats. Única, tuya, ganada en la cancha.",
      color: "#f5d769",
    },
  ];

  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>

      {/* ── HERO ── */}
      <div style={{textAlign:"center",padding:"60px 20px 48px",maxWidth:"700px",margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 16px",borderRadius:"20px",background:"#00FF9412",border:"1px solid #00FF9433",marginBottom:"28px"}}>
          <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00FF94",display:"inline-block",animation:"mcBlink 1.4s infinite"}}/>
          <span style={{color:"#00FF94",fontSize:"11px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.15em"}}>TEMPORADA ACTIVA</span>
        </div>

        <h1 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"clamp(38px,8vw,72px)",lineHeight:0.92,letterSpacing:"-0.03em",margin:"0 0 20px",color:"#ECECF5"}}>
          TU NIVEL,<br/>
          <span style={{color:"#00FF94",WebkitTextStroke:"0px",textShadow:"0 0 40px #00FF9466"}}>EN UNA CARTA.</span>
        </h1>

        <p style={{color:"#9090A8",fontSize:"clamp(15px,2.5vw,18px)",fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.65,margin:"0 auto 36px",maxWidth:"520px"}}>
          Modo Crack convierte tu rendimiento real en el campo en una tarjeta estilo FIFA.
          Haz las pruebas, gana tus stats y consigue la carta que refleja quién eres de verdad.
        </p>

        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <button
            onClick={onShowAuth}
            style={{padding:"14px 32px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:"15px",letterSpacing:"0.04em",boxShadow:"0 4px 24px #00ff9444",transition:"transform 0.15s,box-shadow 0.15s"}}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 32px #00ff9466"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 24px #00ff9444"; }}
          >
            QUIERO MI CARTA →
          </button>
          <button
            onClick={onShowAuth}
            style={{padding:"14px 32px",borderRadius:"10px",border:"1px solid #ffffff18",background:"transparent",color:"#ECECF5",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"15px",transition:"border-color 0.15s,color 0.15s"}}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#ffffff44"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#ffffff18"; e.currentTarget.style.color="#ECECF5"; }}
          >
            YA TENGO CUENTA
          </button>
        </div>
      </div>

      {/* ── DIVISOR ── */}
      <div style={{height:"1px",background:"linear-gradient(90deg,transparent,#ffffff14,transparent)",margin:"0 0 56px"}}/>

      {/* ── CÓMO FUNCIONA ── */}
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"0 20px 64px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{color:"#5A5A6E",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.25em",marginBottom:"10px"}}>EL PROCESO</div>
          <h2 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"clamp(24px,5vw,36px)",color:"#ECECF5",margin:0,letterSpacing:"-0.02em"}}>¿CÓMO FUNCIONO?</h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px"}}>
          {steps.map((s, i) => (
            <div
              key={i}
              style={{background:"#0F0F1A",border:`1px solid ${s.color}22`,borderRadius:"16px",padding:"24px 20px",position:"relative",overflow:"hidden",transition:"border-color 0.2s,transform 0.2s"}}
              onMouseEnter={e => { e.currentTarget.style.borderColor=`${s.color}55`; e.currentTarget.style.transform="translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=`${s.color}22`; e.currentTarget.style.transform=""; }}
            >
              {/* Número de fondo decorativo */}
              <div style={{position:"absolute",top:"-8px",right:"12px",fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"72px",color:`${s.color}08`,lineHeight:1,userSelect:"none"}}>{s.num}</div>

              <div style={{fontSize:"32px",marginBottom:"14px"}}>{s.icon}</div>
              <div style={{color:s.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:700,fontSize:"10px",letterSpacing:"0.2em",marginBottom:"8px"}}>{s.num} — {s.title.toUpperCase()}</div>
              <div style={{color:"#9090A8",fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BANNER FINAL ── */}
      <div style={{margin:"0 20px 64px",borderRadius:"20px",background:"linear-gradient(135deg,#0F1E18,#0A0A18)",border:"1px solid #00FF9422",padding:"40px 32px",textAlign:"center",position:"relative",overflow:"hidden",maxWidth:"860px",marginLeft:"auto",marginRight:"auto"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 80% 50%, #00FF9408 0%, transparent 60%)",pointerEvents:"none"}}/>
        <div style={{fontSize:"40px",marginBottom:"12px"}}>⚽</div>
        <h3 style={{fontFamily:"'Archivo',sans-serif",fontWeight:900,fontSize:"clamp(20px,4vw,30px)",color:"#ECECF5",margin:"0 0 12px",letterSpacing:"-0.01em"}}>¿LISTO PARA SABER TU NIVEL?</h3>
        <p style={{color:"#9090A8",fontFamily:"'Space Grotesk',sans-serif",fontSize:"14px",lineHeight:1.6,maxWidth:"440px",margin:"0 auto 28px"}}>
          Regístrate hoy, preséntate a la evaluación y llévate la carta que te ganaste. Va a ser mucho más entretenido de lo que crees.
        </p>
        <button
          onClick={onShowAuth}
          style={{padding:"14px 36px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#00FF94,#00C972)",color:"#07070D",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:"15px",letterSpacing:"0.04em",boxShadow:"0 4px 24px #00ff9433"}}
        >
          REGISTRARME AHORA
        </button>
      </div>

    </div>
  );
}
