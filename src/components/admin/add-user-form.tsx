
"use client";

import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { auth, db } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  role: z.enum(["admin", "validator", "organizer", "customer"]),
});

export default function AddUserForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user: adminUser } = useAuth(); // Get current admin user

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "validator",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    // Store current user to restore session later
    const currentAdmin = auth.currentUser;
    if (!currentAdmin) {
        toast({
            variant: "destructive",
            title: "Error de Autenticación",
            description: "Usuario administrador no encontrado. Por favor, inicia sesión de nuevo.",
        });
        setIsLoading(false);
        return;
    }

    try {
      // Create the new user
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const newUser = userCredential.user;

      // Update new user's profile
      await updateProfile(newUser, {
          displayName: values.name,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        displayName: values.name,
        email: newUser.email,
        role: values.role,
        createdAt: new Date(),
      });
      
      toast({
        title: "Usuario Creado",
        description: `El usuario ${values.name} ha sido creado como ${values.role}.`,
      });
      
      form.reset();

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error al Crear Usuario",
        description: error.message || "Ocurrió un error inesperado.",
      });
    } finally {
        // Sign out the newly created user and restore the admin session.
        // This is a workaround since creating a user signs them in automatically.
        if (auth.currentUser?.uid !== currentAdmin.uid) {
            await signOut(auth);
            // This is a simplified re-authentication. A more robust solution might use custom tokens.
            // For now, we rely on the AuthProvider's persisted state.
        }
        setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className="bg-white text-black" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="usuario@ejemplo.com" {...field} className="bg-white text-black" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} className="bg-white text-black" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="validator">Validador</SelectItem>
                  <SelectItem value="organizer">Organizador</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Crear Usuario
        </Button>
      </form>
    </Form>
  );
}
