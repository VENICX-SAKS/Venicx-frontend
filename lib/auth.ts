import Cookies from "js-cookie";

const TOKEN_KEY = "venicx_token";

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
  return !!getToken();
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  full_name: string;
  exp: number;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}
