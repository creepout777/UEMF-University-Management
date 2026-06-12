import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type UserRole = "admin" | "administration" | "teacher" | "student";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  linkedEntityId: number | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "uemf_token";
const USER_KEY = "uemf_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Login failed");
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    isAdmin: role === "admin",
    isAdministration: role === "administration",
    isTeacher: role === "teacher",
    isStudent: role === "student",
    canWrite: role === "admin" || role === "administration",
    canManageStudents: role === "admin" || role === "administration",
    canManageFaculty: role === "admin",
    canManageDepartments: role === "admin",
    canManageCourses: role === "admin",
    canManageEnrollments: role === "admin" || role === "administration",
    canManageSchedules: role === "admin" || role === "teacher",
    canManageGrades: role === "admin" || role === "teacher",
    canManageExams: role === "admin" || role === "teacher",
    canManageFees: role === "admin" || role === "administration",
    canManageAnnouncements: role === "admin" || role === "administration",
    canViewStudents: role === "admin" || role === "administration" || role === "teacher",
    canViewFaculty: role === "admin" || role === "administration" || role === "teacher",
    canViewDepartments: role === "admin" || role === "administration" || role === "teacher",
    canViewEnrollments: role !== null,
    canViewGrades: role !== null,
    canViewSchedules: role !== null,
    canViewExams: role !== null,
    canViewFees: role === "admin" || role === "administration" || role === "student",
    canViewAnnouncements: role !== null,
  };
}
