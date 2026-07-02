"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthUser } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Cargar usuario desde API (tokens en httpOnly cookies)
  const loadUserFromApi = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { 
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading user from API:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromApi();
  }, [loadUserFromApi]);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthUser | null> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: "Error al iniciar sesión",
          description: data.error || "Usuario o contraseña incorrectos.",
          variant: "destructive",
        });
        return null;
      }

      if (!data.data) {
        toast({
          title: "Usuario no encontrado",
          description: "Verifica tus datos o regístrate.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Bienvenido 👋",
        description: data.data.email,
      });

      setUser(data.data);
      router.push("/dashboard");
      return data.data;

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el servidor.",
        variant: "destructive",
      });
      return null;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    setUser(null);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    
    router.push("/");
    router.refresh();
  };

  const refreshAuth = async () => {
    await loadUserFromApi();
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        });
        return true;
      } else {
        toast({
          title: "Error al registrarse",
          description: data.error || "No se pudo crear la cuenta.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el servidor.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = { user, loading, login, logout, register, refreshAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
