import FifaCard from "./FifaCard";

export default function PrintView({ players, currentUserId, onClose }) {
  const toPrint = players.filter(p => p._selected).length > 0
    ? players.filter(p => p._selected)
    : players;

  return (
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:1000,overflowY:"auto"}}>
      <div style={{padding:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #eee"}} className="no-print">
        <h2 style={{margin:0,fontFamily:"'Rajdhani',sans-serif",color:"#1a1a2e",fontWeight:900}}>Vista Impresión — {toPrint.length} carta(s)</h2>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={() => window.print()} style={{padding:"10px 24px",borderRadius:"8px",border:"none",background:"#6c63ff",color:"#fff",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>IMPRIMIR</button>
          <button onClick={onClose} style={{padding:"10px 24px",borderRadius:"8px",border:"1px solid #ddd",background:"transparent",color:"#666",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>CERRAR</button>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"20px",padding:"30px",justifyContent:"center",background:"#f5f5f5",minHeight:"calc(100vh - 70px)"}}>
        {toPrint.map(p => <FifaCard key={p.id} player={p} currentUserId={currentUserId} />)}
      </div>
    </div>
  );
}
