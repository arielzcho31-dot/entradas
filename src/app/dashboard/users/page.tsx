"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Importa el componente Badge
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define la interfaz para el usuario
interface User {
  id: string;
  displayName: string;
  email: string;
  role: string | null; // permitir null
  createdAt: string;
  ci?: string;
  numero?: string;
  usuario?: string;
  universidad?: string;
}

// Componente para mostrar el rol con colores (seguro ante null/undefined)
const RoleBadge = ({ role }: { role: string | null | undefined }) => {
  const roleStyles: { [key: string]: string } = {
    admin: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    customer: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    validador: 'bg-blue-800 hover:bg-blue-900 text-white border-transparent',
    organizador: 'bg-sky-500 hover:bg-sky-600 text-white border-transparent',
    'sin-rol': 'bg-gray-500 text-white border-transparent'
  };
  const safe = role && role.trim() ? role : 'sin-rol';
  const label = safe === 'sin-rol'
    ? 'Sin rol'
    : safe.charAt(0).toUpperCase() + safe.slice(1);
  return (
    <Badge className={roleStyles[safe] || 'bg-gray-500 text-white'}>
      {label}
    </Badge>
  );
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [filter, setFilter] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Función para obtener todos los usuarios
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, displayName, email, role, createdAt, ci, numero, usuario, universidad')
      .order('createdAt', { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios." });
    } else {
      // normaliza roles nulos a 'customer'
      setUsers((data || []).map(u => ({ ...u, role: u.role ?? 'customer' })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para crear un nuevo usuario
  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingUser(true);
    const formData = new FormData(event.currentTarget);
    const newUserPayload = {
      displayName: formData.get('displayName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      ci: formData.get('ci') as string,
      numero: formData.get('numero') as string,
      usuario: formData.get('usuario') as string,
      universidad: formData.get('universidad') as string,
      role: formData.get('role') as string,
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload),
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(prevUsers => [result.user, ...prevUsers]);
        toast({ title: "Usuario Creado", description: "El nuevo usuario ha sido registrado exitosamente." });
        (event.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo crear el usuario.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al crear", description: error.message });
    } finally {
      setCreatingUser(false);
    }
  };

  // Función para manejar la actualización de un usuario
  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;

    const updatedData: { [key: string]: any } = {
      displayName: formData.get('displayName') as string,
      role: formData.get('role') as string,
      ci: formData.get('ci') as string,
      numero: formData.get('numero') as string,
      usuario: formData.get('usuario') as string,
      universidad: formData.get('universidad') as string,
    };

    // Solo incluye la contraseña en la petición si el campo no está vacío
    if (password) {
      updatedData.password = password;
    }

    const response = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUsers(users.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
      toast({ title: "Usuario actualizado", description: "Los datos del usuario han sido guardados." });
      setEditingUser(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el usuario." });
    }
  };

  // Función para manejar la eliminación de un usuario
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const response = await fetch(`/api/users/${deletingUser.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setUsers(users.filter(u => u.id !== deletingUser.id));
      toast({ title: "Usuario eliminado", description: "El usuario ha sido eliminado del sistema." });
      setDeletingUser(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario." });
    }
  };

  // Filtra los usuarios según el texto del input
  const filteredUsers = users.filter(user =>
    (user.displayName || '').toLowerCase().includes(filter.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-foreground">
          Crea, visualiza y administra todos los usuarios registrados.
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-6">
        {/* Formulario para Crear Usuario (Colapsable) */}
        <AccordionItem value="item-1">
          <Card>
            <AccordionTrigger className="p-6">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Crear Nuevo Usuario
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-displayName">Nombre Completo</Label>
                      <Input id="create-displayName" name="displayName" required className="bg-white text-black" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-email">Email</Label>
                      <Input id="create-email" name="email" type="email" required className="bg-white text-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-ci">CI</Label>
                      <Input id="create-ci" name="ci" className="bg-white text-black" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-numero">Número</Label>
                      <Input id="create-numero" name="numero" className="bg-white text-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-usuario">Usuario</Label>
                      <Input id="create-usuario" name="usuario" className="bg-white text-black" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-universidad">Universidad</Label>
                      <Input id="create-universidad" name="universidad" className="bg-white text-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-password">Contraseña</Label>
                      <Input id="create-password" name="password" type="password" required className="bg-white text-black" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-role">Rol</Label>
                      <Select name="role" defaultValue="customer" required>
                        <SelectTrigger className="bg-white text-black">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Cliente</SelectItem>
                          <SelectItem value="validador">Validador</SelectItem>
                          <SelectItem value="organizador">Organizador</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={creatingUser}>
                    {creatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear Usuario"}
                  </Button>
                </form>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Lista de Usuarios (Colapsable) */}
        <AccordionItem value="item-2">
          <Card>
            <AccordionTrigger className="w-full p-6">
              <div className="flex justify-between w-full items-center">
                <div className="text-left">
                  <CardTitle>Lista de Usuarios</CardTitle>
                  <CardDescription className="mt-1">
                    Total de usuarios registrados: {users.length}
                  </CardDescription>
                </div>
                {/* Los controles se han movido fuera del Trigger */}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                {/* Los controles ahora están aquí, dentro del contenido del acordeón */}
                <div className="flex items-center justify-end gap-2 mb-4">
                  <Button size="icon" onClick={fetchUsers} className="bg-green-600 text-white hover:bg-green-700">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Input
                    placeholder="Filtrar por nombre o email..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="relative max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-black">Nombre</TableHead>
                          <TableHead className="text-black">Email</TableHead>
                          <TableHead className="hidden sm:table-cell text-black">Rol</TableHead>
                          <TableHead className="text-center text-black">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-transparent">
                              <TableCell className="font-medium">{user.displayName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <RoleBadge role={user.role} />
                              </TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingUser(user)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                              No se encontraron usuarios.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      {/* Diálogo para Editar Usuario */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario: {editingUser?.displayName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Nombre Completo</Label>
              <Input id="displayName" name="displayName" defaultValue={editingUser?.displayName} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ci">CI</Label>
                <Input id="ci" name="ci" defaultValue={editingUser?.ci} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" name="numero" defaultValue={editingUser?.numero} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input id="usuario" name="usuario" defaultValue={editingUser?.usuario} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="universidad">Universidad</Label>
                <Input id="universidad" name="universidad" defaultValue={editingUser?.universidad} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select name="role" defaultValue={editingUser?.role ?? undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Cliente</SelectItem>
                    <SelectItem value="validador">Validador</SelectItem>
                    <SelectItem value="organizador">Organizador</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input id="password" name="password" type="password" placeholder="Dejar en blanco para no cambiar" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Confirmar Eliminación */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al usuario <span className="font-bold">{deletingUser?.displayName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
