"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  ci?: string;
  numero?: string;
  universidad?: string;
  usuario?: string;
  createdAt: string;
}

interface UsersListProps {
  refreshTrigger: number;
}

export default function UsersList({ refreshTrigger }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const userData = await response.json();
      setUsers(userData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Usuarios Registrados ({users.length})</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user._id}>
            <CardHeader>
              <CardTitle className="text-sm">{user.displayName || 'Sin nombre'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Rol:</strong> {user.role}</div>
                {user.ci && <div><strong>CI:</strong> {user.ci}</div>}
                {user.numero && <div><strong>Teléfono:</strong> {user.numero}</div>}
                {user.universidad && <div><strong>Universidad:</strong> {user.universidad}</div>}
                {user.usuario && <div><strong>Usuario:</strong> {user.usuario}</div>}
                <div><strong>Creado:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay usuarios registrados
        </div>
      )}
    </div>
  );
}