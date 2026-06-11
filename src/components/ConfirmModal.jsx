export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{background:"#0d0d1a",border:"1px solid #333",borderRadius:"16px",padding:"28px 32px",maxWidth:"360px",width:"100%",textAlign:"center",boxShadow:"0 0 40px #00000099"}}>
        <div style={{fontSize:"36px",marginBottom:"12px"}}>🗑️</div>
        <p style={{color:"#ccc",fontFamily:"'Rajdhani',sans-serif",fontSize:"16px",lineHeight:1.6,marginBottom:"24px"}}>{message}</p>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"12px",borderRadius:"10px",border:"1px solid #333",background:"transparent",color:"#888",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"14px"}}>CANCELAR</button>
          <button onClick={onConfirm} style={{flex:1,padding:"12px",borderRadius:"10px",border:"none",background:"#ff4d4d",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"14px"}}>ELIMINAR</button>
        </div>
      </div>
    </div>
  );
}
