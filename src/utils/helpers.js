const FLAG_MAP = {
  Argentina: "🇦🇷", Brasil: "🇧🇷", Chile: "🇨🇱", Colombia: "🇨🇴",
  Uruguay: "🇺🇾", México: "🇲🇽", España: "🇪🇸", Francia: "🇫🇷",
  Alemania: "🇩🇪", Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Portugal: "🇵🇹", Italia: "🇮🇹",
  Holanda: "🇳🇱", Bélgica: "🇧🇪", Croacia: "🇭🇷",
};

export const calcOverall = (stats) => {
  if (!stats) return 0;
  const vals = Object.values(stats).map(Number).filter(v => !isNaN(v));
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
};

export const getCardType = (overall) =>
  overall >= 87 ? "toty"
  : overall >= 82 ? "gold_rare"
  : overall >= 75 ? "gold_nonrare"
  : overall >= 65 ? "silver"
  : "bronze";

export const adjustColor = (hex, amt) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

export const getFlagEmoji = (country) => FLAG_MAP[country] || "🌐";
