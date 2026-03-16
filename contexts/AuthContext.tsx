"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CurrentUser, getCurrentUser, isAuthenticated, logout } from "@/lib/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  logout,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<CurrentUser | null>(() =>
    isAuthenticated() ? getCurrentUser() : null
  );

  return (
    <AuthContext.Provider value={{ user, isLoading: false, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
