"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Interfaz para los datos del perfil que vienen de la tabla 'users'
interface ProfileData {
  displayName: string;
  ci: string;
  numero: string;
  usuario: string;
  universidad: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const { toast } = useToast();

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    setIsFetchingProfile(true);
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          displayName: data.display_name || '',
          ci: data.ci || '',
          numero: data.numero || '',
          usuario: data.usuario || '',
          universidad: data.universidad || ''
        });
      } else {
        console.error('Error fetching profile details');
      }
    } catch (err) {
      console.error('Unexpected profile fetch error:', err);
    } finally {
      setIsFetchingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;

    const updatedData: { [key: string]: any } = {
      displayName: formData.get('displayName') as string,
      ci: formData.get('ci') as string,
      numero: formData.get('numero') as string,
      usuario: formData.get('usuario') as string,
      universidad: formData.get('universidad') as string,
    };

    if (password) {
      updatedData.password = password;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('No se pudo actualizar el perfil.');
      }
      const updatedUser = await response.json();
      setProfileData({
        displayName: updatedUser.displayName || '',
        ci: updatedUser.ci || '',
        numero: updatedUser.numero || '',
        usuario: updatedUser.usuario || '',
        universidad: updatedUser.universidad || ''
      });
      toast({ title: 'Perfil Actualizado', description: 'Tus datos han sido guardados.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isFetchingProfile) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-foreground">
          Actualiza tu información personal y contraseña.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tus Datos</CardTitle>
          <CardDescription>
            Mantén tu información al día.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre Completo</Label>
                <Input id="displayName" name="displayName" defaultValue={profileData?.displayName || ''} className="bg-white text-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (no se puede cambiar)</Label>
                <Input id="email" name="email" defaultValue={user?.email} disabled className="bg-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ci">CI</Label>
                <Input id="ci" name="ci" defaultValue={profileData?.ci || ''} className="bg-white text-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" name="numero" defaultValue={profileData?.numero || ''} className="bg-white text-black" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input id="usuario" name="usuario" defaultValue={profileData?.usuario || ''} className="bg-white text-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="universidad">Universidad</Label>
                <Input id="universidad" name="universidad" defaultValue={profileData?.universidad || ''} className="bg-white text-black" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input id="password" name="password" type="password" placeholder="Dejar en blanco para no cambiar" className="bg-white text-black" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
