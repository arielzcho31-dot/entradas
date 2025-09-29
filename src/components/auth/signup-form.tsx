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
import { doc, setDoc } from "firebase/firestore";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const nombre = formData.get("nombre") as string;
    const apellido = formData.get("apellido") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const fullName = `${nombre} ${apellido}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      await setDoc(doc(db, "users", user.uid), {
        displayName: fullName,
        email: user.email,
        role: "customer",
        createdAt: new Date(),
        // Storing other fields from form
        ci: formData.get("ci"),
        numero: formData.get("numero"),
        usuario: formData.get("usuario"),
        universidad: formData.get("universidad"),
      });

      toast({
        title: "Cuenta Creada",
        description: "Tu cuenta ha sido creada con éxito. Por favor, inicia sesión.",
      });
      router.push("/login");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en el Registro",
        description: error.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-card-foreground">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Crea tu Cuenta</h1>
        <p className="text-muted-foreground mt-1">Regístrate para unirte a la fiesta.</p>
      </header>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" placeholder="Tu nombre" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" name="apellido" placeholder="Tu apellido" required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="ci">CI</Label>
                <Input id="ci" name="ci" placeholder="5.456.125" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" name="numero" placeholder="0991 123 456" required />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="usuario">Usuario</Label>
            <Input id="usuario" name="usuario" placeholder="usuario_unico" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="universidad">Universidad</Label>
            <Input id="universidad" name="universidad" placeholder="Ej: UNIDA" required />
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
                    className="pr-10"
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
