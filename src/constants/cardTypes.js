export const CARD_TYPES = {
  gold_rare:    { label: "Gold Rare", bg: "#c9a227", accent: "#f5d769", text: "#3d2800", glow: "#f5d769" },
  gold_nonrare: { label: "Gold",      bg: "#b8860b", accent: "#d4a017", text: "#3d2800", glow: "#d4a017" },
  silver:       { label: "Silver",    bg: "#8e9eab", accent: "#c9d6df", text: "#1a1a2e", glow: "#c9d6df" },
  bronze:       { label: "Bronze",    bg: "#a0522d", accent: "#cd853f", text: "#2d1200", glow: "#cd853f" },
  toty:         { label: "TOTY",      bg: "#0a0a1a", accent: "#00d4ff", text: "#ffffff", glow: "#00d4ff" },
  inform:       { label: "In Form",   bg: "#1a3a1a", accent: "#00ff88", text: "#ffffff", glow: "#00ff88" },
  hero:         { label: "Hero",      bg: "#1a0a2e", accent: "#ff6ec7", text: "#ffffff", glow: "#ff6ec7" },
};

export const statLabels = {
  pace: "PAC", shooting: "SHO", passing: "PAS",
  dribbling: "DRI", defending: "DEF", physical: "PHY",
};

export const statColors = {
  pace: "#00d4ff", shooting: "#ff6b6b", passing: "#00ff88",
  dribbling: "#ffd93d", defending: "#6c63ff", physical: "#ff6ec7",
};

export const defaultStats = {
  pace: 70, shooting: 70, passing: 70,
  dribbling: 70, defending: 70, physical: 70,
};
