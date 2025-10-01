
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { User } from "@/lib/placeholder-data";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
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
    
    const userRole = "customer";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;

      await updateProfile(authUser, {
        displayName: fullName,
      });

      const batch = writeBatch(db);

      // 1. Create user document
      const userRef = doc(db, "users", authUser.uid);
      const userDataForDb = {
        displayName: fullName,
        email: authUser.email,
        role: userRole,
        createdAt: new Date(),
        ci: ci,
        numero: formData.get("numero"),
        usuario: formData.get("usuario"),
        universidad: formData.get("universidad"),
      };
      batch.set(userRef, userDataForDb);

      // 2. Create associated ticket document
      const ticketRef = doc(collection(db, "tickets"));
      const ticketCode = `TICKET-${authUser.uid.substring(0, 8).toUpperCase()}`;
      batch.set(ticketRef, {
        userId: authUser.uid,
        userCi: ci,
        userName: fullName,
        ticketCode: ticketCode,
        status: "disabled", // disabled, enabled, used
        createdAt: new Date(),
        orderId: null,
        enabledAt: null,
        usedAt: null,
      });

      await batch.commit();

      const user: User = {
        id: authUser.uid,
        name: fullName,
        email: authUser.email!,
        role: userRole,
      };
      
      login(user);

      toast({
        title: "¡Bienvenido!",
        description: `Tu cuenta ha sido creada con éxito, ${user.name}.`,
      });
      router.push("/");

    } catch (error: any) {
      let description = "Ocurrió un error inesperado.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.";
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Error en el Registro",
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
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input id="fullName" name="fullName" placeholder="Tu nombre completo" required className="bg-white text-black" />
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="ci">CI</Label>
                <Input id="ci" name="ci" placeholder="5.456.125" required className="bg-white text-black" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" name="numero" placeholder="0991 123 456" required className="bg-white text-black" />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="bg-white text-black" />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="usuario">Usuario</Label>
            <Input id="usuario" name="usuario" placeholder="usuario_unico" required className="bg-white text-black" />
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
