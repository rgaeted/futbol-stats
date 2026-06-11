import { useState } from "react";
import FifaCard from "./FifaCard";
import StatSlider from "./StatSlider";
import { POSITIONS, NATIONALITIES, CLUBS } from "../constants/lists";
import { CARD_TYPES, statLabels, statColors, defaultStats } from "../constants/cardTypes";
import { calcOverall, getCardType } from "../utils/helpers";

const inp = {width:"100%",background:"#0d0d1a",border:"1px solid #333",borderRadius:"8px",padding:"10px 14px",color:"#fff",fontSize:"14px",fontFamily:"'Rajdhani',sans-serif",boxSizing:"border-box",outline:"none"};
const lbl = {color:"#888",fontSize:"11px",fontWeight:700,letterSpacing:"0.1em",marginBottom:"4px",display:"block",fontFamily:"'Rajdhani',sans-serif"};

export default function PlayerForm({ initial, currentUserId, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name:"", position:"ST", nationality:"Chile", club:"Colo-Colo", age:"", number:"", photoUrl:"", cardType:"", stats:{...defaultStats} }
  );
  const [tab, setTab]         = useState("info");
  const [saving, setSaving]   = useState(false);
  const [nameError, setNameError] = useState(false);

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setStat = (k, v) => setForm(f => ({ ...f, stats: { ...f.stats, [k]: v } }));

  const overall  = calcOverall(form.stats);
  const autoType = getCardType(overall);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setNameError(true); return; }
    setNameError(false);
    setSaving(true);
    try {
      await onSave({ ...form, cardType: form.cardType || autoType });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{display:"flex",gap:"32px",flexWrap:"wrap",alignItems:"flex-start"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
        <FifaCard player={{...form, cardType: form.cardType || autoType, userId: currentUserId}} currentUserId={currentUserId} />
        <div style={{color:"#555",fontSize:"11px",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.1em"}}>VISTA PREVIA EN VIVO</div>
      </div>

      <div style={{flex:1,minWidth:"320px"}}>
        {/* Tabs */}
        <div style={{display:"flex",gap:"4px",marginBottom:"24px",background:"#0d0d1a",padding:"4px",borderRadius:"10px"}}>
          {[["info","📋 Info"],["stats","📊 Stats"],["card","🎨 Carta"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{flex:1,padding:"8px",borderRadius:"7px",border:"none",cursor:"pointer",background:tab===id?"#6c63ff":"transparent",color:tab===id?"#fff":"#666",fontWeight:700,fontSize:"13px",fontFamily:"'Rajdhani',sans-serif",transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>

        {tab === "info" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={lbl}>NOMBRE COMPLETO</label>
              <input
                style={{...inp, border:`1px solid ${nameError ? "#ff4d4d" : "#333"}`}}
                placeholder="Ej: Alexis Sánchez"
                value={form.name}
                onChange={e => { set("name", e.target.value); if (e.target.value.trim()) setNameError(false); }}
              />
              {nameError && <p style={{color:"#ff4d4d",fontSize:"11px",fontFamily:"'Rajdhani',sans-serif",marginTop:"4px"}}>El nombre es requerido</p>}
            </div>
            <div><label style={lbl}>POSICIÓN</label><select style={inp} value={form.position} onChange={e => set("position", e.target.value)}>{POSITIONS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label style={lbl}>EDAD</label><input style={inp} type="number" min={14} max={50} placeholder="25" value={form.age} onChange={e => set("age", e.target.value)} /></div>
            <div><label style={lbl}>NACIONALIDAD</label><select style={inp} value={form.nationality} onChange={e => set("nationality", e.target.value)}>{NATIONALITIES.map(n => <option key={n}>{n}</option>)}</select></div>
            <div><label style={lbl}>CLUB</label><select style={inp} value={form.club} onChange={e => set("club", e.target.value)}>{CLUBS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>NÚMERO</label><input style={inp} type="number" min={1} max={99} placeholder="10" value={form.number} onChange={e => set("number", e.target.value)} /></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>URL DE FOTO (opcional)</label><input style={inp} placeholder="https://..." value={form.photoUrl} onChange={e => set("photoUrl", e.target.value)} /></div>
          </div>
        )}

        {tab === "stats" && (
          <div>
            <div style={{background:"#0d0d1a",borderRadius:"12px",padding:"16px",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #222"}}>
              <span style={{color:"#888",fontFamily:"'Rajdhani',sans-serif",fontSize:"13px",fontWeight:700,letterSpacing:"0.1em"}}>OVERALL CALCULADO</span>
              <span style={{fontSize:"42px",fontWeight:900,fontFamily:"'Rajdhani',sans-serif",color:overall>=87?"#00d4ff":overall>=82?"#f5d769":overall>=75?"#d4a017":overall>=65?"#c9d6df":"#cd853f"}}>{overall}</span>
            </div>
            {Object.entries(statLabels).map(([key, label]) => (
              <StatSlider key={key} label={label} statKey={key} value={form.stats[key]} onChange={setStat} color={statColors[key]} />
            ))}
          </div>
        )}

        {tab === "card" && (
          <div>
            <label style={lbl}>TIPO DE CARTA</label>
            <p style={{color:"#555",fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",marginBottom:"16px"}}>Auto-asignado: <span style={{color:"#6c63ff"}}>{CARD_TYPES[autoType]?.label}</span></p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {[["", "Auto (según overall)"], ...Object.entries(CARD_TYPES).map(([k, v]) => [k, v.label])].map(([key, label]) => (
                <button key={key} onClick={() => set("cardType", key)} style={{padding:"12px",borderRadius:"10px",border:`2px solid ${(form.cardType||"")===key?"#6c63ff":"#222"}`,background:(form.cardType||"")===key?"#6c63ff22":"#0d0d1a",color:(form.cardType||"")===key?"#fff":"#888",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"13px",transition:"all 0.2s"}}>{label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:"12px",marginTop:"28px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"14px",borderRadius:"10px",border:"1px solid #333",background:"transparent",color:"#888",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px"}}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{flex:2,padding:"14px",borderRadius:"10px",border:"none",background:saving?"#333":"linear-gradient(135deg,#6c63ff,#00d4ff)",color:"#fff",cursor:saving?"wait":"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:900,fontSize:"16px",letterSpacing:"0.1em",boxShadow:saving?"none":"0 4px 20px #6c63ff55",transition:"all 0.2s"}}>
            {saving ? "GUARDANDO..." : (initial ? "ACTUALIZAR JUGADOR" : "CREAR JUGADOR")}
          </button>
        </div>
      </div>
    </div>
  );
}
