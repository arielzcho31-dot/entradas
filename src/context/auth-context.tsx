"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabaseClient"; // Usamos el nuevo cliente
import { AuthUser } from "@/types"; // Esta línea ahora funcionará
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
}
import { useToast } from "@/hooks/use-toast"; // 👈 importamos el toast

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  //const { toast } = useToast();
  const { toast } = useToast(); // 👈 inicializamos el hook

  const getSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const userWithRole = {
        ...session.user,
        role: session.user.user_metadata.role || "customer",
      };
      setUser(userWithRole);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const userWithRole = {
            ...session.user,
            role: session.user.user_metadata.role || "customer",
          };
          setUser(userWithRole);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getSession]);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthUser | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Usuario o contraseña incorrectos.",
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

    const userWithRole = {
      ...data.user,
      role: data.user.user_metadata?.role || "customer",
    };

    setUser(userWithRole);
    router.push("/dashboard"); // 👈 ejemplo de redirección post-login
    return userWithRole;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh(); // Asegura que el estado del servidor se limpie
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
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
