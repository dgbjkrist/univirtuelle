import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "secretaire" | "enseignant";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, User & { password: string }> = {
  "admin@univ.dz": { id: "1", email: "admin@univ.dz", name: "Ahmed Benali", role: "admin", password: "admin123" },
  "secretaire@univ.dz": { id: "2", email: "secretaire@univ.dz", name: "Fatima Zohra", role: "secretaire", password: "sec123" },
  "enseignant@univ.dz": { id: "3", email: "enseignant@univ.dz", name: "Karim Hadj", role: "enseignant", password: "ens123" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("demo_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      localStorage.setItem("demo_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("demo_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
