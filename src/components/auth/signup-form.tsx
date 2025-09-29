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
        <div className="inline-block bg-primary text-primary-foreground text-sm font-bold py-1 px-4 rounded-full mb-4">
            NUEVO REGISTRO
        </div>
        <h1 className="text-3xl font-bold tracking-wider">SOLICITUD DE ACCESO</h1>
        <p className="text-sm tracking-widest mt-1">FORMULARIO DE INSCRIPCIÓN</p>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="text-xs font-bold">NOMBRE:</Label>
            <Input id="nombre" name="nombre" placeholder="Tu nombre" required className="bg-white text-black" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apellido" className="text-xs font-bold">APELLIDO:</Label>
            <Input id="apellido" name="apellido" placeholder="Tu apellido" required className="bg-white text-black"/>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="ci" className="text-xs font-bold">CI:</Label>
                <Input id="ci" name="ci" placeholder="5.456.125" required className="bg-white text-black"/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="numero" className="text-xs font-bold">NUMERO:</Label>
                <Input id="numero" name="numero" placeholder="0991 123 456" required className="bg-white text-black"/>
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email" className="text-xs font-bold">CORREO ELECTRÓNICO:</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="bg-white text-black"/>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="usuario" className="text-xs font-bold">USUARIO:</Label>
            <Input id="usuario" name="usuario" placeholder="usuario unico" required className="bg-white text-black"/>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="universidad" className="text-xs font-bold">UNIVERSIDAD:</Label>
            <Input id="universidad" name="universidad" placeholder="UNIDA" required className="bg-white text-black"/>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="password" className="text-xs font-bold">CONTRASEÑA:</Label>
            <div className="relative">
                <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    className="bg-white text-black pr-10"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
      </div>

      <footer className="mt-8">
        <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-accent text-primary-foreground" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "CREAR CUENTA"}
        </Button>
        <div className="flex items-center justify-center mt-4 space-x-2">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                TÉRMINOS Y CONDICIONES
            </label>
        </div>
        <div className="mt-4 text-center text-xs">
          <Link href="/login" className="underline hover:text-primary">
            ¿YA TIENES CUENTA? INICIA SESIÓN
          </Link>
        </div>
      </footer>
    </form>
  );
}
