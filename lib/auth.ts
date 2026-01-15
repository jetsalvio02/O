export async function get_user() {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("user");
  }
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
  }
}
