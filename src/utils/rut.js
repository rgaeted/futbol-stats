export const formatRut = (raw) => {
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  const dv  = clean.slice(-1);
  const num = clean.slice(0, -1);
  const fmt = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fmt + "-" + dv;
};

export const validateRut = (rut) => {
  const clean = rut.replace(/[.\-]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const dv  = clean.slice(-1);
  const num = parseInt(clean.slice(0, -1), 10);
  if (isNaN(num)) return false;
  let sum = 0, factor = 2, n = num;
  while (n > 0) {
    sum += (n % 10) * factor;
    n = Math.floor(n / 10);
    factor = factor === 7 ? 2 : factor + 1;
  }
  const expected = 11 - (sum % 11);
  const calc = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  return calc === dv;
};
