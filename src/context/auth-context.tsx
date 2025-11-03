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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clave para localStorage
const USER_STORAGE_KEY = 'ticketwise_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Cargar usuario desde localStorage al montar
  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthUser | null> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al iniciar sesión",
          description: data.error || "Usuario o contraseña incorrectos.",
          variant: "destructive",
        });
        return null;
      }

      if (!data.user) {
        toast({
          title: "Usuario no encontrado",
          description: "Verifica tus datos o regístrate.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Bienvenido 👋",
        description: data.user.email,
      });

      const userWithRole: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || "user",
        user_metadata: {
          displayName: data.user.display_name,
          role: data.user.role,
        },
      };

      // Guardar en localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithRole));
      setUser(userWithRole);
      
      router.push("/dashboard");
      return userWithRole;

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
    // Limpiar localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    
    router.push("/");
    router.refresh();
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

  const value = { user, loading, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
