const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function api<T>(path:string, options:RequestInit={}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers);
  headers.set("Content-Type","application/json");
  if(token) headers.set("Authorization",`Bearer ${token}`);
  const res=await fetch(`${API}${path}`,{...options,headers});
  if(!res.ok) {
    const text=await res.text();
    let message=text;
    try { message=JSON.parse(text).message || text; } catch {}
    throw new Error(message);
  }
  return res.status===204 ? undefined as T : await res.json() as T;
}
export function setToken(token:string){localStorage.setItem("token",token)}
export function clearToken(){localStorage.removeItem("token")}
