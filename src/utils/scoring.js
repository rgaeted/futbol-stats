// Converts raw test measurements to 10-99 scores using PROTOCOLS scoring tables

function normalizeRange(rangeStr) {
  return rangeStr
    .replace(/Nivel\s*/gi, "")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/–/g, "-")
    .trim();
}

function matchesRange(value, rangeStr) {
  const s = normalizeRange(rangeStr);
  if (s.startsWith(">=")) return value >= parseFloat(s.slice(2).trim());
  if (s.startsWith("<=")) return value <= parseFloat(s.slice(2).trim());
  if (s.startsWith(">"))  return value >  parseFloat(s.slice(1).trim());
  if (s.startsWith("<"))  return value <  parseFloat(s.slice(1).trim());
  if (s.includes("/")) {
    // "10/10" style — treat as exact-match upper bound
    const num = parseFloat(s.split("/")[0]);
    return value >= num;
  }
  if (s.includes("-")) {
    const parts = s.split("-");
    const mn = parseFloat(parts[0].trim());
    const mx = parseFloat(parts[1].trim());
    return !isNaN(mn) && !isNaN(mx) && value >= mn && value <= mx;
  }
  const num = parseFloat(s);
  return !isNaN(num) && Math.abs(value - num) < 0.01;
}

function ptsMidpoint(ptsStr) {
  const s = ptsStr.replace(/–/g, "-").trim();
  if (s.includes("-")) {
    const [a, b] = s.split("-").map(x => parseInt(x.trim()));
    return Math.round((a + b) / 2);
  }
  return parseInt(s);
}

// Returns { score: number, label: string } or null if rawValue is empty/invalid
export function scoreTestValue(rawValue, scoringRows) {
  const v = parseFloat(rawValue);
  if (isNaN(v) || !scoringRows) return null;
  for (const row of scoringRows) {
    if (matchesRange(v, row.range)) {
      return { score: ptsMidpoint(row.pts), label: row.label };
    }
  }
  return { score: 10, label: "Por mejorar" };
}

// Weighted average of scores; skips null entries (redistributes weight proportionally)
export function weightedAvg(scores, weights) {
  let total = 0, totalW = 0;
  scores.forEach((s, i) => {
    if (s !== null && s !== undefined) {
      total += s * weights[i];
      totalW += weights[i];
    }
  });
  if (totalW === 0) return null;
  return Math.min(99, Math.max(1, Math.round(total / totalW)));
}

// Observation component definitions per stat key
export const OBS_COMPONENTS = {
  shooting: { label: "Técnica observada",   key: "obs_sho" },
  passing:  { label: "Pierna no dominante", key: "obs_pas" },
  physical: { label: "Complexión física",   key: "obs_phy" },
};

// Formula weights: test[0], test[1], ..., obs (if any)
export const FORMULA_WEIGHTS = {
  pace:      { tests: [0.60, 0.40] },
  shooting:  { tests: [0.55, 0.30], obs: 0.15 },
  passing:   { tests: [0.50, 0.35], obs: 0.15 },
  dribbling: { tests: [0.55, 0.45] },
  defending: { tests: [0.50, 0.50] },
  physical:  { tests: [0.55, 0.30], obs: 0.15 },
};
