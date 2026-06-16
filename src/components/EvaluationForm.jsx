import { useState, useMemo } from "react";
import { PROTOCOLS } from "../constants/protocols";
import { getAgeCategory, calcAge } from "../constants/ageCategories";
import { scoreTestValue, weightedAvg, OBS_COMPONENTS, FORMULA_WEIGHTS } from "../utils/scoring";
import FifaCard from "./FifaCard";
import { calcOverall } from "../utils/helpers";

function ScoreBadge({ result }) {
  if (!result) return <span style={{ color: "#5A5A6E", fontSize: "11px" }}>—</span>;
  const color = result.score >= 75 ? "#00FF94" : result.score >= 50 ? "#ffd93d" : "#ff6b6b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: "20px", color }}>{result.score}</span>
      <span style={{ color: "#5A5A6E", fontSize: "10px", fontFamily: "'Chakra Petch',sans-serif" }}>{result.label}</span>
    </div>
  );
}

function StatBar({ label, abbr, color, value }) {
  const pct = value !== null ? Math.round((value / 99) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: "11px", color, width: "30px", flexShrink: 0 }}>{abbr}</span>
      <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "#1a1a2e", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.3s" }} />
      </div>
      <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: "16px", color: value !== null ? "#ECECF5" : "#5A5A6E", width: "28px", textAlign: "right" }}>
        {value !== null ? value : "—"}
      </span>
    </div>
  );
}

export default function EvaluationForm({ player, onClose, onSave }) {
  const ageCat = getAgeCategory(player.birthDate);
  const catKey = ageCat?.key || "senior";
  const age = calcAge(player.birthDate);

  // testInputs[protocolKey][testIndex] = raw string value
  const [testInputs, setTestInputs] = useState(() => {
    const init = {};
    PROTOCOLS.forEach(p => {
      init[p.key] = {};
      p.tests.forEach((_, i) => { init[p.key][i] = ""; });
    });
    return init;
  });

  // obsInputs[protocolKey] = manual observation score (10–99)
  const [obsInputs, setObsInputs] = useState({ shooting: "", passing: "", physical: "" });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState("");

  const setTestVal = (pKey, idx, val) =>
    setTestInputs(prev => ({ ...prev, [pKey]: { ...prev[pKey], [idx]: val } }));

  // Derived: score result per test
  const testScoreResults = useMemo(() => {
    const out = {};
    PROTOCOLS.forEach(p => {
      out[p.key] = p.tests.map((test, i) => {
        const raw = testInputs[p.key][i];
        if (raw === "") return null;
        const scoring = test.scoring[catKey] || test.scoring.senior;
        return scoreTestValue(raw, scoring);
      });
    });
    return out;
  }, [testInputs, catKey]);

  // Derived: final calculated stats
  const calcStats = useMemo(() => {
    const result = {};
    PROTOCOLS.forEach(p => {
      const fw = FORMULA_WEIGHTS[p.key];
      const scores = testScoreResults[p.key].map(r => r?.score ?? null);
      const weights = [...fw.tests];
      if (fw.obs !== undefined) {
        const obsRaw = obsInputs[p.key];
        scores.push(obsRaw !== "" ? parseFloat(obsRaw) : null);
        weights.push(fw.obs);
      }
      result[p.key] = weightedAvg(scores, weights);
    });
    return result;
  }, [testScoreResults, obsInputs]);

  const previewPlayer = useMemo(() => {
    const merged = {};
    PROTOCOLS.forEach(p => { merged[p.key] = calcStats[p.key] ?? player.stats?.[p.key] ?? 50; });
    return { ...player, stats: merged };
  }, [calcStats, player]);

  const previewOverall = calcOverall(previewPlayer.stats);
  const hasAnyInput = PROTOCOLS.some(p =>
    p.tests.some((_, i) => testInputs[p.key][i] !== "") ||
    (OBS_COMPONENTS[p.key] && obsInputs[p.key] !== "")
  );

  const handleSave = async () => {
    const finalStats = {};
    PROTOCOLS.forEach(p => {
      finalStats[p.key] = calcStats[p.key] ?? player.stats?.[p.key] ?? 50;
    });
    setSaving(true);
    try {
      await onSave(finalStats, notes);
      setSaved(true);
      setTimeout(onClose, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 110, overflowY: "auto", padding: "16px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#0A0A14", border: "1px solid #7B5BFF44", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "820px", margin: "auto", boxShadow: "0 0 80px #7B5BFF22", position: "relative" }}
      >
        {/* Header */}
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ffffff18", background: "#161626", color: "#5A5A6E", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ color: "#5A5A6E", fontSize: "10px", fontWeight: 700, letterSpacing: "0.25em", fontFamily: "'Chakra Petch',sans-serif", marginBottom: "4px" }}>MODO CRACK</div>
          <h2 style={{ margin: 0, fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: "26px", color: "#ECECF5", letterSpacing: "-0.01em" }}>📋 EVALUAR JUGADOR</h2>
          <p style={{ margin: "6px 0 0", color: "#5A5A6E", fontSize: "13px", fontFamily: "'Space Grotesk',sans-serif" }}>
            {player.name} · {ageCat ? `${ageCat.icon} ${ageCat.label}` : "Sin categoría"}{age !== null ? ` · ${age} años` : ""}
          </p>
        </div>

        {/* Live preview */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "28px" }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: "#5A5A6E", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", fontFamily: "'Chakra Petch',sans-serif", marginBottom: "8px", textAlign: "center" }}>VISTA PREVIA</div>
            <FifaCard player={previewPlayer} size="small" />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ color: "#5A5A6E", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", fontFamily: "'Chakra Petch',sans-serif", marginBottom: "12px" }}>STATS CALCULADOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PROTOCOLS.map(p => (
                <StatBar key={p.key} label={p.label} abbr={p.abbr} color={p.color} value={calcStats[p.key]} />
              ))}
            </div>
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "#161626", borderRadius: "10px", border: "1px solid #ffffff0a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#5A5A6E", fontFamily: "'Chakra Petch',sans-serif", fontSize: "11px", fontWeight: 700 }}>OVERALL</span>
              <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: "28px", color: "#00FF94" }}>{previewOverall}</span>
            </div>
          </div>
        </div>

        {/* Protocol sections */}
        {PROTOCOLS.map(p => {
          const fw = FORMULA_WEIGHTS[p.key];
          const obs = OBS_COMPONENTS[p.key];
          const statVal = calcStats[p.key];
          return (
            <div key={p.key} style={{ marginBottom: "20px", border: `1px solid ${p.color}22`, borderRadius: "14px", overflow: "hidden" }}>
              {/* Section header */}
              <div style={{ padding: "12px 18px", background: `${p.color}0e`, borderBottom: `1px solid ${p.color}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{p.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: "13px", color: p.color, letterSpacing: "0.1em" }}>{p.abbr} — {p.label}</div>
                    <div style={{ color: "#5A5A6E", fontSize: "10px", fontFamily: "'Space Grotesk',sans-serif" }}>{p.formula}</div>
                  </div>
                </div>
                {statVal !== null && (
                  <div style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: "28px", color: p.color }}>{statVal}</div>
                )}
              </div>

              {/* Tests */}
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {p.tests.map((test, i) => {
                  const result = testScoreResults[p.key][i];
                  const weight = fw.tests[i];
                  return (
                    <div key={i} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div style={{ flex: 2, minWidth: "180px" }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "13px", color: "#ECECF5", marginBottom: "2px" }}>
                          {test.name}
                          <span style={{ color: "#5A5A6E", fontWeight: 400, fontSize: "11px", marginLeft: "6px" }}>× {weight}</span>
                        </div>
                        <div style={{ color: "#5A5A6E", fontSize: "11px", fontFamily: "'Space Grotesk',sans-serif", marginBottom: "8px", lineHeight: 1.4 }}>{test.objective}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="number"
                            step="0.01"
                            value={testInputs[p.key][i]}
                            onChange={e => setTestVal(p.key, i, e.target.value)}
                            placeholder="Resultado..."
                            style={{ width: "120px", background: "#161626", border: `1px solid ${result ? p.color + "66" : "#ffffff18"}`, borderRadius: "8px", padding: "8px 12px", color: "#ECECF5", fontSize: "14px", fontFamily: "'Space Grotesk',sans-serif", outline: "none", transition: "border 0.2s" }}
                          />
                          <span style={{ color: "#5A5A6E", fontSize: "11px", fontFamily: "'Chakra Petch',sans-serif" }}>{test.unit}</span>
                        </div>
                      </div>
                      <div style={{ minWidth: "120px", paddingTop: "30px" }}>
                        <ScoreBadge result={result} />
                      </div>
                    </div>
                  );
                })}

                {/* Observation component (if any) */}
                {obs && (
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start", paddingTop: "4px", borderTop: "1px solid #ffffff08" }}>
                    <div style={{ flex: 2, minWidth: "180px" }}>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "13px", color: "#ECECF5", marginBottom: "2px" }}>
                        {obs.label}
                        <span style={{ color: "#5A5A6E", fontWeight: 400, fontSize: "11px", marginLeft: "6px" }}>× {fw.obs}</span>
                      </div>
                      <div style={{ color: "#5A5A6E", fontSize: "11px", fontFamily: "'Space Grotesk',sans-serif", marginBottom: "8px" }}>Observación del evaluador (10–99)</div>
                      <input
                        type="number"
                        min="10"
                        max="99"
                        value={obsInputs[p.key]}
                        onChange={e => setObsInputs(prev => ({ ...prev, [p.key]: e.target.value }))}
                        placeholder="10 – 99"
                        style={{ width: "120px", background: "#161626", border: `1px solid ${obsInputs[p.key] !== "" ? p.color + "66" : "#ffffff18"}`, borderRadius: "8px", padding: "8px 12px", color: "#ECECF5", fontSize: "14px", fontFamily: "'Space Grotesk',sans-serif", outline: "none" }}
                      />
                    </div>
                    <div style={{ minWidth: "120px", paddingTop: "30px" }}>
                      {obsInputs[p.key] !== "" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 900, fontSize: "20px", color: parseFloat(obsInputs[p.key]) >= 75 ? "#00FF94" : parseFloat(obsInputs[p.key]) >= 50 ? "#ffd93d" : "#ff6b6b" }}>
                            {Math.min(99, Math.max(10, Math.round(parseFloat(obsInputs[p.key]))))}
                          </span>
                          <span style={{ color: "#5A5A6E", fontSize: "10px", fontFamily: "'Chakra Petch',sans-serif" }}>observado</span>
                        </div>
                      ) : <span style={{ color: "#5A5A6E", fontSize: "11px" }}>—</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Notes */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ color: "#5A5A6E", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", fontFamily: "'Chakra Petch',sans-serif", marginBottom: "8px" }}>NOTAS DE LA EVALUACIÓN (opcional)</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones generales del evaluador..."
            rows={3}
            style={{ width: "100%", background: "#161626", border: "1px solid #ffffff12", borderRadius: "10px", padding: "12px 16px", color: "#ECECF5", fontSize: "13px", fontFamily: "'Space Grotesk',sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "12px 24px", borderRadius: "10px", border: "1px solid #ffffff18", background: "transparent", color: "#5A5A6E", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "14px" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasAnyInput || saving || saved}
            style={{ padding: "12px 32px", borderRadius: "10px", border: "none", background: saved ? "#00FF9444" : hasAnyInput ? "linear-gradient(135deg,#7B5BFF,#5B3BDF)" : "#2a2a3e", color: saved ? "#00FF94" : hasAnyInput ? "#fff" : "#5A5A6E", cursor: hasAnyInput && !saving && !saved ? "pointer" : "default", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "14px", boxShadow: hasAnyInput && !saved ? "0 2px 16px #7B5BFF55" : "none", transition: "all 0.2s" }}
          >
            {saved ? "✓ Guardado" : saving ? "Guardando..." : "💾 GUARDAR EVALUACIÓN"}
          </button>
        </div>
      </div>
    </div>
  );
}
