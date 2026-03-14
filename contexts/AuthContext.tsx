"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
