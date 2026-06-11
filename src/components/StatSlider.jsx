export default function StatSlider({ label, statKey, value, onChange, color }) {
  return (
    <div style={{marginBottom:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
        <label style={{color:"#aaa",fontSize:"12px",fontWeight:700,letterSpacing:"0.1em",fontFamily:"'Rajdhani',sans-serif"}}>{label}</label>
        <span style={{color,fontSize:"20px",fontWeight:900,fontFamily:"'Rajdhani',sans-serif"}}>{value}</span>
      </div>
      <input
        type="range" min={1} max={99} value={value}
        onChange={e => onChange(statKey, parseInt(e.target.value))}
        style={{width:"100%",accentColor:color,cursor:"pointer"}}
      />
    </div>
  );
}
