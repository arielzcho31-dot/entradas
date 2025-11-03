"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const ci = formData.get("ci") as string;
    const numero = formData.get("numero") as string;
    const usuario = formData.get("usuario") as string;

    // Validaciones del lado del cliente
    if (!ci || !numero || !email) {
      toast({
        variant: "destructive",
        title: "Campos obligatorios",
        description: "CI, Celular y Correo son obligatorios.",
      });
      setIsLoading(false);
      return;
    }

    // Validar que CI solo contenga números
    if (!/^\d+$/.test(ci)) {
      toast({
        variant: "destructive",
        title: "CI inválido",
        description: "La cédula debe contener solo números.",
      });
      setIsLoading(false);
      return;
    }

    // Validar que número solo contenga números
    if (!/^\d+$/.test(numero)) {
      toast({
        variant: "destructive",
        title: "Celular inválido",
        description: "El número de celular debe contener solo números.",
      });
      setIsLoading(false);
      return;
    }

    // Validar que usuario solo contenga letras, números y guiones bajos
    if (!/^[a-zA-Z0-9_]+$/.test(usuario)) {
      toast({
        variant: "destructive",
        title: "Usuario inválido",
        description: "El usuario solo puede contener letras, números y guiones bajos.",
      });
      setIsLoading(false);
      return;
    }
    
    const userRole = "user";

    try {
      // Llama al endpoint de registro vía contexto
      const userData = {
        displayName: fullName,
        email,
        password,
        ci,
        numero: formData.get("numero") as string,
        usuario: formData.get("usuario") as string,
        universidad: formData.get("universidad") as string,
        role: userRole,
      };
      const success = await register(userData);
      if (success) {
        // Login automático tras registro exitoso
        const loggedInUser = await login(email, password);
        if (loggedInUser) {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold">¡Bienvenido!</span>
              </div>
            ) as any,
            description: `Tu cuenta ha sido creada con éxito, ${fullName}.`,
          });
          router.refresh();
          router.push("/");
        } else {
          toast({
            variant: "destructive",
            title: (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Error al iniciar sesión</span>
              </div>
            ) as any,
            description: "No se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.",
          });
          router.push("/login");
        }
      } else {
        toast({
          variant: "destructive",
          title: (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              <span className="font-bold">Error en el Registro</span>
            </div>
          ) as any,
          description: "No se pudo crear la cuenta. Intenta de nuevo.",
        });
      }
    } catch (error: any) {
      let description = "Ocurrió un error inesperado.";
      // Simplifica el manejo de errores
      if (error.message.includes('El email ya está registrado')) {
        description = "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.";
      } else {
        description = error.message || description;
      }
      
      toast({
        variant: "destructive",
        title: (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              <span className="font-bold">Error en el Registro</span>
            </div>
          ) as any,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-card-foreground">
      <header className="text-center mb-8">
        <div className="bg-primary text-primary-foreground rounded-lg py-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Crea tu Cuenta</h1>
        </div>
        <p className="text-muted-foreground/80 mt-1">Regístrate para unirte a la fiesta.</p>
      </header>

      <div className="space-y-4">
         <div className="grid gap-2">
            <Label htmlFor="fullName">Nombre Completo *</Label>
            <Input id="fullName" name="fullName" placeholder="Tu nombre completo" required className="bg-white text-black" />
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="ci">CI *</Label>
                <Input 
                  id="ci" 
                  name="ci" 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="5456125" 
                  required 
                  className="bg-white text-black" 
                  onInput={e => { 
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') 
                  }} 
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="numero">Celular *</Label>
                <Input 
                  id="numero" 
                  name="numero" 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="0991123456" 
                  required 
                  className="bg-white text-black" 
                  onInput={e => { 
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') 
                  }} 
                />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="bg-white text-black" />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="usuario">Usuario *</Label>
            <Input 
              id="usuario" 
              name="usuario" 
              placeholder="usuario_unico" 
              required 
              className="bg-white text-black"
              pattern="[a-zA-Z0-9_]+"
              title="Solo letras, números y guiones bajos"
              onInput={e => { 
                e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z0-9_]/g, '') 
              }}
            />
            <p className="text-xs text-muted-foreground">Solo letras, números y guiones bajos (_)</p>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="universidad">Universidad</Label>
            <Input id="universidad" name="universidad" placeholder="Ej: UNIDA" required className="bg-white text-black" />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
                <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    className="pr-10 bg-white text-black"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
      </div>

      <footer className="mt-8">
        <div className="flex items-start space-x-2 mb-4">
            <Checkbox id="terms" className="mt-1" />
            <label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Acepto los términos y condiciones de servicio.
            </label>
        </div>
        <Button type="submit" className="w-full h-11 text-base font-bold" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear Mi Cuenta"}
        </Button>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline hover:text-primary">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </footer>
    </form>
  );
}

