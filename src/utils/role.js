// ดึง session จาก localStorage
export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("psuSession");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Session parse error:", e);
    return null;
  }
}

// ดึง role_id ของ user
export function getRoleId() {
  const session = getSession();
  return session?.user?.role_id || null;
}

// ดึง role name
export function getRoleName() {
  const session = getSession();
  return session?.user?.role_name || "ไม่พบสิทธิ์";
}

// -------------------------
// ROLE CHECK FUNCTIONS
// -------------------------

// 900 = CEO
export function isCeo() {
  return getRoleId() === 900;
}

// 1000 = ผู้ดูแลระบบ
export function isAdmin() {
  return getRoleId() === 1000;
}

// Admin หรือ CEO
export function isAdminOrCeo() {
  const role = getRoleId();
  return role === 900 || role === 1000;
}

// 2000 = เจ้าหน้าที่วิจัย
export function isResearchStaff() {
  return getRoleId() === 2000;
}

// 3000 = ผู้ใช้งานทั่วไป
export function isGeneralUser() {
  return getRoleId() === 3000;
}

// 4000 = ผู้ร่วมวิจัยภายนอก
export function isExternalResearcher() {
  return getRoleId() === 4000;
}

// 5000 = ผู้ชมข้อมูล
export function isViewer() {
  return getRoleId() === 5000;
}

// ผู้ใช้ที่ไม่ใช่ admin / ceo
export function isNormalUser() {
  const role = getRoleId();
  return role !== 900 && role !== 1000 && role !== null;
}
