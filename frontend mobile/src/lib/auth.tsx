/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { AuthResponse, setAuthToken } from "@/lib/api";

type AuthUser = Pick<AuthResponse, "userId" | "email" | "firstName" | "lastName">;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser, token: string) => void;
  logout: () => void;
  creditSyncVersion: number;
  triggerCreditSync: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [creditSyncVersion, setCreditSyncVersion] = useState(0);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      setUser: (nextUser, nextToken) => {
        setUserState(nextUser);
        setToken(nextToken);
        setAuthToken(nextToken);  // sync JWT into api.ts module
      },
      logout: () => {
        setUserState(null);
        setToken(null);
        setAuthToken(null);  // clear JWT from api.ts module
      },
      creditSyncVersion,
      triggerCreditSync: () => setCreditSyncVersion((value) => value + 1),
    }),
    [user, token, creditSyncVersion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};