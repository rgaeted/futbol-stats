import { useState, useRef } from "react";
import FifaCard from "./FifaCard";
import StatSlider from "./StatSlider";
import { POSITIONS, POSITION_LABELS, NATIONALITIES, CLUBS } from "../constants/lists";
import { REGIONS_CHILE } from "../constants/regions";
import { AGE_CATEGORIES, getAgeCategory, calcAge, formatBirthDate } from "../constants/ageCategories";
import { CARD_TYPES, statLabels, statColors, defaultStats } from "../constants/cardTypes";
import { calcOverall, getCardType } from "../utils/helpers";
import { uploadPhoto } from "../utils/storage";
import { removeBackground } from "@imgly/background-removal";

const inp = {width:"100%",background:"#161626",border:"1px solid #ffffff12",borderRadius:"8px",padding:"10px 14px",color:"#ECECF5",fontSize:"14px",fontFamily:"'Space Grotesk',sans-serif",boxSizing:"border-box",outline:"none"};
const lbl = {color:"#5A5A6E",fontSize:"11px",fontWeight:600,letterSpacing:"0.12em",marginBottom:"4px",display:"block",fontFamily:"'Chakra Petch',sans-serif"};

export default function PlayerForm({ initial, currentUserId, availableUsers = [], onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name:"", position:"ST", nationality:"Chile", club:"Colo-Colo", birthDate:"", number:"", photoUrl:"", photoOffsetX:0, photoOffsetY:0, cardType:"", region:"", assignedUserId:"", stats:{...defaultStats} }
  );
  const [tab,           setTab]         = useState("info");
  const [saving,        setSaving]      = useState(false);
  const [nameError,     setNameError]   = useState(false);

  const [photoStatus,   setPhotoStatus] = useState(null);
  const [uploadError,   setUploadError] = useState("");
  const [localPreview,  setLocalPreview]= useState(null);
  const [draggingPhoto, setDraggingPhoto] = useState(false);
  const fileInputRef   = useRef(null);
  const dragContainerRef = useRef(null);
  const dragRef        = useRef(null);

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setStat = (k, v) => setForm(f => ({ ...f, stats: { ...f.stats, [k]: v } }));

  const overall       = calcOverall(form.stats);
  const autoType      = getCardType(overall);
  const selectedRegion= REGIONS_CHILE.find(r => r.key === form.region);
  const ageCat        = getAgeCategory(form.birthDate);
  const age           = calcAge(form.birthDate);

  const startDrag = (e) => {
    const pt = e.touches ? e.touches[0] : e;
    dragRef.current = {
      startX: pt.clientX, startY: pt.clientY,
      origX: form.photoOffsetX || 0, origY: form.photoOffsetY || 0,
    };
    setDraggingPhoto(true);
  };

  const onDrag = (e) => {
    if (!draggingPhoto || !dragRef.current || !dragContainerRef.current) return;
    const pt = e.touches ? e.touches[0] : e;
    const { width, height } = dragContainerRef.current.getBoundingClientRect();
    const dx = (pt.clientX - dragRef.current.startX) / width  * 100;
    const dy = (pt.clientY - dragRef.current.startY) / height * 100;
    set("photoOffsetX", Math.max(-100, Math.min(100, dragRef.current.origX + dx)));
    set("photoOffsetY", Math.max(-100, Math.min(100, dragRef.current.origY + dy)));
  };

  const endDrag = () => setDraggingPhoto(false);

  const handleAgeChange = (v) => set("age", v);

  const handlePhotoFile = async (file) => {
    if (!file) return;
    setUploadError("");

    // Show original immediately while processing
    const originalUrl = URL.createObjectURL(file);
    setLocalPreview(originalUrl);
    set("photoUrl", originalUrl);

    try {
      // Step 1: remove background (downloads ~43MB model on first use, then cached)
      setPhotoStatus("processing");
      const processedBlob = await removeBackground(file);

      // Show processed preview
      URL.revokeObjectURL(originalUrl);
      const processedUrl = URL.createObjectURL(processedBlob);
      setLocalPreview(processedUrl);
      set("photoUrl", processedUrl);

      // Step 2: upload PNG with transparent background
      setPhotoStatus("uploading");
      const publicUrl = await uploadPhoto(processedBlob, "png");

      URL.revokeObjectURL(processedUrl);
      setLocalPreview(null);
      set("photoUrl", publicUrl);
    } catch (e) {
      setUploadError("Error al procesar la foto. Intenta de nuevo.");
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      set("photoUrl", "");
    } finally {
      setPhotoStatus(null);
    }
  };

  const clearPhoto = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    set("photoUrl", "");
    setUploadError("");
    setPhotoStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setNameError(true); return; }
    if (photoStatus) return;
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
        {ageCat && (
          <div style={{padding:"6px 16px",borderRadius:"20px",background:`${ageCat.color}18`,border:`1px solid ${ageCat.color}44`,display:"flex",gap:"8px",alignItems:"center"}}>
            <span>{ageCat.icon}</span>
            <span style={{color:ageCat.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",letterSpacing:"0.08em"}}>{ageCat.label}</span>
            {age !== null && <span style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif"}}>· {age} años</span>}
          </div>
        )}
        {selectedRegion && (
          <div style={{padding:"5px 14px",borderRadius:"20px",background:`${selectedRegion.color}18`,border:`1px solid ${selectedRegion.color}44`,display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{color:selectedRegion.color,fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,fontSize:"12px",letterSpacing:"0.08em"}}>📍 {selectedRegion.label}</span>
          </div>
        )}
        <div style={{color:"#5A5A6E",fontSize:"11px",fontFamily:"'Chakra Petch',sans-serif",letterSpacing:"0.12em"}}>VISTA PREVIA EN VIVO</div>
      </div>

      <div style={{flex:1,minWidth:"320px"}}>

        {/* User picker — only when creating a new card */}
        {!initial && (
          <div style={{marginBottom:"24px",background:"#0F0F1A",border:"1px solid #ffffff12",borderRadius:"12px",padding:"16px"}}>
            <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"12px"}}>ASIGNAR A JUGADOR REGISTRADO</div>
            {availableUsers.length === 0 ? (
              <div style={{color:"#5A5A6E",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",padding:"8px 0"}}>
                Todos los usuarios registrados ya tienen carta, o no hay usuarios aún.
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"6px",maxHeight:"200px",overflowY:"auto"}}>
                {/* "Sin asignar" option */}
                <button
                  type="button"
                  onClick={() => set("assignedUserId", "")}
                  style={{
                    display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"8px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",
                    background: form.assignedUserId === "" ? "#ffffff0a" : "transparent",
                    border: `1px solid ${form.assignedUserId === "" ? "#ffffff22" : "transparent"}`,
                  }}
                >
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"#161626",border:"1px solid #ffffff12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}}>—</div>
                  <span style={{color:"#5A5A6E",fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px"}}>Sin asignar</span>
                </button>
                {availableUsers.map(u => {
                  const isSelected = form.assignedUserId === u.id;
                  const initials = u.email ? u.email[0].toUpperCase() : "?";
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => set("assignedUserId", u.id)}
                      style={{
                        display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",borderRadius:"8px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",
                        background: isSelected ? "#00FF9415" : "transparent",
                        border: `1px solid ${isSelected ? "#00FF9444" : "transparent"}`,
                      }}
                    >
                      <div style={{width:"32px",height:"32px",borderRadius:"50%",background:isSelected?"#00FF9422":"#161626",border:`1px solid ${isSelected?"#00FF9466":"#ffffff12"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:700,color:isSelected?"#00FF94":"#5A5A6E",fontFamily:"'Archivo',sans-serif",flexShrink:0}}>
                        {initials}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:isSelected?"#ECECF5":"#ECECF5",fontFamily:"'Space Grotesk',sans-serif",fontSize:"13px",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {u.email ?? u.id.slice(0, 8) + "..."}
                        </div>
                        {isSelected && <div style={{color:"#00FF94",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.08em",marginTop:"2px"}}>SELECCIONADO</div>}
                      </div>
                      {isSelected && <span style={{color:"#00FF94",fontSize:"16px",flexShrink:0}}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",gap:"4px",marginBottom:"24px",background:"#0F0F1A",padding:"4px",borderRadius:"10px"}}>
          {[["info","📋 Info"],["stats","📊 Stats"],["card","🎨 Carta"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{flex:1,padding:"8px",borderRadius:"7px",border:"none",cursor:"pointer",background:tab===id?"#00FF94":"transparent",color:tab===id?"#07070D":"#5A5A6E",fontWeight:700,fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>

        {tab === "info" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={lbl}>NOMBRE COMPLETO</label>
              <input
                style={{...inp, border:`1px solid ${nameError ? "#ff4d4d" : "#ffffff12"}`}}
                placeholder="Ej: Alexis Sánchez"
                value={form.name}
                onChange={e => { set("name", e.target.value); if (e.target.value.trim()) setNameError(false); }}
              />
              {nameError && <p style={{color:"#ff4d4d",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"4px"}}>El nombre es requerido</p>}
            </div>

            <div><label style={lbl}>POSICIÓN</label><select style={inp} value={form.position} onChange={e => set("position", e.target.value)}>{POSITIONS.map(p => <option key={p} value={p}>{p} — {POSITION_LABELS[p]}</option>)}</select></div>

            <div>
              <label style={lbl}>FECHA DE NACIMIENTO</label>
              <input
                style={{...inp, borderColor: ageCat ? ageCat.color : "#ffffff12", colorScheme:"dark"}}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.birthDate}
                onChange={e => set("birthDate", e.target.value)}
              />
              {ageCat && <p style={{color:ageCat.color,fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"4px"}}>{ageCat.icon} {ageCat.label} · {age} años</p>}
            </div>

            <div><label style={lbl}>NACIONALIDAD</label><select style={inp} value={form.nationality} onChange={e => set("nationality", e.target.value)}>{NATIONALITIES.map(n => <option key={n}>{n}</option>)}</select></div>
            <div><label style={lbl}>CLUB</label><select style={inp} value={form.club} onChange={e => set("club", e.target.value)}>{CLUBS.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>NÚMERO</label><input style={inp} type="number" min={1} max={99} placeholder="10" value={form.number} onChange={e => set("number", e.target.value)} /></div>

            <div style={{gridColumn:"1/-1"}}>
              <label style={lbl}>REGIÓN DE CHILE</label>
              <select
                style={{...inp, borderColor: selectedRegion ? selectedRegion.color : "#ffffff12"}}
                value={form.region}
                onChange={e => set("region", e.target.value)}
              >
                <option value="">— Sin región —</option>
                {REGIONS_CHILE.map(r => <option key={r.key} value={r.key}>{r.num} · {r.label}</option>)}
              </select>
              {selectedRegion && <p style={{color:selectedRegion.color,fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"4px"}}>📍 Capital: {selectedRegion.capital}</p>}
            </div>

            <div style={{gridColumn:"1/-1"}}>
              <label style={lbl}>FOTO DEL JUGADOR</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{display:"none"}}
                onChange={e => handlePhotoFile(e.target.files?.[0])}
              />
              {form.photoUrl ? (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px",background:"#161626",borderRadius:"8px",border:"1px solid #ffffff12"}}>
                    <img src={form.photoUrl} alt="" style={{width:"56px",height:"56px",objectFit:"cover",borderRadius:"6px",border:"1px solid #ffffff22",flexShrink:0}} />
                    <div style={{flex:1}}>
                      {photoStatus === "processing"
                        ? <div style={{color:"#00E5FF",fontSize:"12px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.08em"}}>✂️ Eliminando fondo...</div>
                        : photoStatus === "uploading"
                        ? <div style={{color:"#00FF94",fontSize:"12px",fontFamily:"'Chakra Petch',sans-serif",fontWeight:600,letterSpacing:"0.08em"}}>⬆️ Subiendo foto...</div>
                        : <div style={{color:"#ECECF5",fontSize:"13px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>✓ Foto lista</div>
                      }
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!!photoStatus} style={{padding:"6px 12px",borderRadius:"6px",border:"1px solid #ffffff22",background:"transparent",color:"#ECECF5",cursor:photoStatus?"wait":"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:"12px"}}>Cambiar</button>
                    <button type="button" onClick={clearPhoto} disabled={!!photoStatus} style={{padding:"6px 12px",borderRadius:"6px",border:"1px solid #ff4d4d44",background:"#ff4d4d11",color:"#ff4d4d",cursor:photoStatus?"wait":"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:"12px"}}>Quitar</button>
                  </div>
                  {!photoStatus && (
                    <div style={{marginTop:"8px"}}>
                      <div style={{color:"#5A5A6E",fontSize:"10px",fontWeight:700,letterSpacing:"0.15em",fontFamily:"'Chakra Petch',sans-serif",marginBottom:"6px"}}>AJUSTAR POSICIÓN</div>
                      <div
                        ref={dragContainerRef}
                        onMouseDown={startDrag}
                        onMouseMove={onDrag}
                        onMouseUp={endDrag}
                        onMouseLeave={endDrag}
                        onTouchStart={startDrag}
                        onTouchMove={e => { e.preventDefault(); onDrag(e); }}
                        onTouchEnd={endDrag}
                        style={{height:"130px",borderRadius:"8px",border:`1px solid ${draggingPhoto?"#00FF9444":"#ffffff1a"}`,cursor:draggingPhoto?"grabbing":"grab",position:"relative",overflow:"hidden",background:"repeating-conic-gradient(#ffffff07 0% 25%,transparent 0% 50%) 0 0/14px 14px",userSelect:"none",touchAction:"none"}}
                      >
                        <img
                          src={form.photoUrl}
                          alt=""
                          draggable={false}
                          style={{position:"absolute",top:"50%",left:"50%",height:"130%",width:"auto",maxWidth:"none",transform:`translate(calc(-50% + ${form.photoOffsetX||0}%),calc(-50% + ${form.photoOffsetY||0}%))`,pointerEvents:"none",userSelect:"none",transition:draggingPhoto?"none":"transform 0.08s"}}
                        />
                        <div style={{position:"absolute",bottom:"6px",left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
                          <span style={{color:"#ffffff33",fontSize:"10px",fontFamily:"'Chakra Petch',sans-serif",letterSpacing:"0.1em"}}>
                            {draggingPhoto ? "✓ AJUSTANDO" : "↔ ARRASTRA PARA AJUSTAR"}
                          </span>
                        </div>
                      </div>
                      {(form.photoOffsetX || form.photoOffsetY) ? (
                        <button type="button" onClick={() => { set("photoOffsetX",0); set("photoOffsetY",0); }} style={{marginTop:"6px",padding:"4px 12px",borderRadius:"6px",border:"1px solid #ffffff22",background:"transparent",color:"#5A5A6E",cursor:"pointer",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif"}}>Centrar</button>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{width:"100%",padding:"20px",borderRadius:"8px",border:"2px dashed #ffffff1a",background:"#161626",color:"#5A5A6E",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"border-color 0.15s,color 0.15s"}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#00FF9444"; e.currentTarget.style.color="#ECECF5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#ffffff1a"; e.currentTarget.style.color="#5A5A6E"; }}
                >
                  <span style={{fontSize:"20px"}}>📷</span>
                  <span>Seleccionar foto</span>
                </button>
              )}
              {uploadError && <p style={{color:"#ff4d4d",fontSize:"11px",fontFamily:"'Space Grotesk',sans-serif",marginTop:"4px"}}>⚠ {uploadError}</p>}
            </div>
          </div>
        )}

        {tab === "stats" && (
          <div>
            <div style={{background:"#0F0F1A",borderRadius:"12px",padding:"16px",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #ffffff12"}}>
              <span style={{color:"#5A5A6E",fontFamily:"'Chakra Petch',sans-serif",fontSize:"12px",fontWeight:600,letterSpacing:"0.12em"}}>TU NIVEL</span>
              <span style={{fontSize:"42px",fontWeight:900,fontFamily:"'Archivo',sans-serif",color:overall>=87?"#00E5FF":overall>=82?"#f5d769":overall>=75?"#d4a017":overall>=65?"#c9d6df":"#cd853f"}}>{overall}</span>
            </div>
            {Object.entries(statLabels).map(([key, label]) => (
              <StatSlider key={key} label={label} statKey={key} value={form.stats[key]} onChange={setStat} color={statColors[key]} />
            ))}
          </div>
        )}

        {tab === "card" && (
          <div>
            <label style={lbl}>TIPO DE CARTA</label>
            <p style={{color:"#5A5A6E",fontSize:"12px",fontFamily:"'Space Grotesk',sans-serif",marginBottom:"16px"}}>Auto-asignado: <span style={{color:"#00FF94"}}>{CARD_TYPES[autoType]?.label}</span></p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {[["", "Auto (según overall)"], ...Object.entries(CARD_TYPES).map(([k, v]) => [k, v.label])].map(([key, label]) => (
                <button key={key} onClick={() => set("cardType", key)} style={{padding:"12px",borderRadius:"10px",border:`2px solid ${(form.cardType||"")===key?"#00FF94":"#ffffff12"}`,background:(form.cardType||"")===key?"#00FF9415":"#0F0F1A",color:(form.cardType||"")===key?"#00FF94":"#5A5A6E",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"13px",transition:"all 0.2s"}}>{label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:"12px",marginTop:"28px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"14px",borderRadius:"10px",border:"1px solid #ffffff12",background:"transparent",color:"#5A5A6E",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"15px"}}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || !!photoStatus} style={{flex:2,padding:"14px",borderRadius:"10px",border:"none",background:(saving||photoStatus)?"#161626":"linear-gradient(135deg,#00FF94,#00C972)",color:(saving||photoStatus)?"#5A5A6E":"#07070D",cursor:(saving||photoStatus)?"wait":"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:"16px",letterSpacing:"0.04em",boxShadow:(saving||photoStatus)?"none":"0 4px 20px #00ff9433",transition:"all 0.2s"}}>
            {photoStatus === "processing" ? "ELIMINANDO FONDO..." : photoStatus === "uploading" ? "SUBIENDO FOTO..." : saving ? "GUARDANDO..." : (initial ? "ACTUALIZAR CRACK" : "ACTIVAR MODO CRACK")}
          </button>
        </div>
      </div>
    </div>
  );
}
