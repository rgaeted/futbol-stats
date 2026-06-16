export const AGE_CATEGORIES = [
  { key:"sub10",  label:"Sub-10",  minAge:6,  maxAge:10, color:"#ff6ec7", icon:"🌱" },
  { key:"sub12",  label:"Sub-12",  minAge:11, maxAge:12, color:"#ffd93d", icon:"⭐" },
  { key:"sub14",  label:"Sub-14",  minAge:13, maxAge:14, color:"#00FF94", icon:"🚀" },
  { key:"sub16",  label:"Sub-16",  minAge:15, maxAge:16, color:"#00E5FF", icon:"🔥" },
  { key:"sub18",  label:"Sub-18",  minAge:17, maxAge:18, color:"#7B5BFF", icon:"💥" },
  { key:"sub21",  label:"Sub-21",  minAge:19, maxAge:21, color:"#f5d769", icon:"⚡" },
  { key:"senior", label:"Senior",  minAge:22, maxAge:99, color:"#ff6b6b", icon:"🏆" },
];

export const calcAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const getAgeCategory = (dob) => {
  const age = calcAge(dob);
  if (age === null) return null;
  return AGE_CATEGORIES.find(c => age >= c.minAge && age <= c.maxAge) || null;
};

export const formatBirthDate = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-CL", { day:"2-digit", month:"2-digit", year:"numeric" });
};
