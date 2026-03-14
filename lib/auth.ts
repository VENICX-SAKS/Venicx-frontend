import Cookies from "js-cookie";

const TOKEN_KEY = "venicx_token";

export interface TokenPayload {
  sub: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  full_name: string;
  exp: number;
  iat: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  full_name: string;
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null;
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 1,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): CurrentUser | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    full_name: payload.full_name,
  };
}

export function logout(): void {
  removeToken();
  window.location.href = "/login";
}
