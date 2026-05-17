import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import api, { setAuthToken, clearAuthToken } from "@/lib/api";
import { User, LoginCredentials, SignUpData, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (c: LoginCredentials) => Promise<boolean>;
  signup: (d: SignUpData) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  // LOGIN
  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(p => ({ ...p, isLoading: true }));
    try {
      const res = await api.loginRequest(credentials);
      setAuthToken(res.token);
      const normalizedUser = { ...res.user, id: res.user.id || res.user._id, role: res.user.role.toLowerCase() };
      setAuthState({ user: normalizedUser, isAuthenticated: true, isLoading: false });
      localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setAuthState(p => ({ ...p, isLoading: false }));
      return false;
    }
  }, []);

  // SIGNUP
  const signup = useCallback(async (data: SignUpData) => {
    setAuthState(p => ({ ...p, isLoading: true }));
    try {
      const res = await api.registerRequest(data);
      if (res.token) {
        setAuthToken(res.token);
      }
      const normalizedUser = { ...res.user, id: res.user.id || res.user._id, role: res.user.role.toLowerCase() };
      
      // If signed up from public page, log in. 
      // If added as staff by admin, we might not want to switch user.
      if (res.token) {
        setAuthState({ user: normalizedUser, isAuthenticated: true, isLoading: false });
        localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
      } else {
        setAuthState(p => ({ ...p, isLoading: false }));
      }
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      setAuthState(p => ({ ...p, isLoading: false }));
      throw error;
    }
  }, []);


  // LOGOUT
  const logout = () => {
    clearAuthToken();
    localStorage.removeItem("auth_user");
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  // RESTORE SESSION
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const normalizedUser = { ...parsedUser, id: parsedUser.id || parsedUser._id, role: parsedUser.role.toLowerCase() };
      setAuthState({ user: normalizedUser, isAuthenticated: true, isLoading: false });
    }
  }, []);

  // UPDATE CURRENT USER
  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setAuthState(p => {
      if (!p.user) return p;
      const updatedUser = { ...p.user, ...data };
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      return { ...p, user: updatedUser };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}