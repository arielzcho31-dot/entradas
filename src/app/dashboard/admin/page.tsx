"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Ticket, BarChart, Banknote, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import AddUserForm from '@/components/admin/add-user-form';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  ci?: string;
  numero?: string;
  usuario?: string;
  universidad?: string;
  createdAt: string;
}

interface Entrada {
  _id: string;
  quantity: number;
  comprobanteUrl: string;
  codigoQR: string;
  nombreEntrada: string;
  precioTotal: number;
  userId: string;
  userEmail: string;
  userName: string;
  estado: string;
  createdAt: string;
  manual?: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalEntradas: number;
  enabledEntradas: number;
  pendingEntradas: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEntradas: 0,
    enabledEntradas: 0,
    pendingEntradas: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Verificar permisos de admin
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, [refreshTrigger]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadEntradas(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la información del panel.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadEntradas = async () => {
    try {
      const response = await fetch('/api/entradas');
      if (response.ok) {
        const entradasData = await response.json();
        setEntradas(entradasData);
      }
    } catch (error) {
      console.error('Error loading entradas:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      toast({
        title: "Actualizado",
        description: "Los datos del panel han sido actualizados.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al recargar",
        description: "No se pudo actualizar la información.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      setUsers(users.filter(u => u._id !== userId));
      toast({
        title: "Usuario eliminado",
        description: `El usuario ${userName} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario.",
      });
    }
  };

  const handleUpdateEntradaStatus = async (entradaId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/entradas/${entradaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      // Actualizar el estado local
      setEntradas(entradas.map(entrada => 
        entrada._id === entradaId 
          ? { ...entrada, estado: newStatus }
          : entrada
      ));

      toast({
        title: "Estado actualizado",
        description: `La entrada ha sido ${newStatus === 'enable' ? 'habilitada' : 'deshabilitada'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de la entrada.",
      });
    }
  };

  const handleUserAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'validador':
        return 'secondary';
      case 'organizador':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'enable':
        return 'default'; // Verde
      case 'disable':
        return 'secondary'; // Gris
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesRole && matchesEmail;
  });

  // Obtener entradas recientes (últimas 5)
  const recentEntradas = entradas
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calcular ingresos totales de entradas habilitadas
  const totalSales = entradas
    .filter(entrada => entrada.estado === 'enable' && !entrada.manual)
    .reduce((sum, entrada) => sum + entrada.precioTotal, 0);

  const totalTicketsSold = entradas
    .filter(entrada => entrada.estado === 'enable' && !entrada.manual)
    .reduce((sum, entrada) => sum + entrada.quantity, 0);

  // Entradas generadas manualmente
  const totalManualTickets = entradas
    .filter(entrada => entrada.manual)
    .reduce((sum, entrada) => sum + entrada.quantity, 0);

  const renderUserDetail = (label: string, value?: string) => (
    value && (
      <div className="flex justify-between border-b py-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    )
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
        <p className="text-muted-foreground">
          Una vista completa de tu plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gs. {totalSales.toLocaleString('es-PY')}</div>
            <p className="text-xs text-muted-foreground">Total de ventas verificadas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Vendidas</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">Total de entradas verificadas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Generadas</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalManualTickets}</div>
            <p className="text-xs text-muted-foreground">Entradas generadas manualmente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Activas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enabledEntradas}</div>
            <p className="text-xs text-muted-foreground">Entradas habilitadas actualmente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados en el sistema.</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={['item-3']} className="w-full space-y-6">
        <AccordionItem value="item-1">
          <Card>
            <AccordionTrigger className="p-6">
              <div className="text-left">
                <CardTitle>Entradas Recientes</CardTitle>
                <CardDescription className="mt-1">Una lista de las entradas más recientes.</CardDescription>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell text-black">Entrada</TableHead>
                      <TableHead className="hidden md:table-celltext-black">Fecha</TableHead>
                      <TableHead className="hidden md:table-cell text-black">Estado</TableHead>
                      <TableHead className="text-right text-black">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEntradas.map((entrada) => (
                      <TableRow key={entrada._id}>
                        <TableCell>
                          <div className="font-medium">{entrada.userName}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {entrada.nombreEntrada}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(entrada.createdAt).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getEstadoBadgeVariant(entrada.estado)}>
                            {entrada.estado === 'enable' ? 'Activa' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          Gs. {entrada.precioTotal.toLocaleString('es-PY')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {recentEntradas.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay entradas registradas
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-2">
          <Card>
            <AccordionTrigger className="p-6">
              <div className="text-left">
                <CardTitle>Crear Usuario</CardTitle>
                <CardDescription className="mt-1">Añade un nuevo usuario y asígnale un rol.</CardDescription>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <AddUserForm onUserAdded={handleUserAdded} />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-3">
          <Card>
            <AccordionTrigger className="p-6 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription className="mt-1">Busca, filtra y gestiona todos los usuarios del sistema.</CardDescription>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardHeader className="pt-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="pl-10 bg-white text-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="bg-green-500 hover:bg-green-600 text-black h-9 w-9"
                    >
                      <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                      <span className="sr-only">Recargar</span>
                    </Button>
                    <div className="w-48">
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="bg-white text-black">
                          <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="validador">Validador</SelectItem>
                          <SelectItem value="organizador">Organizador</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-black">Nombre</TableHead>
                        <TableHead className="hidden sm:table-cell text-black">Email</TableHead>
                        <TableHead className="text-center text-black">Rol</TableHead>
                        <TableHead className="text-center text-black">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="link" className="p-0 h-auto font-medium text-card-foreground hover:text-primary">
                                    {user.displayName || 'Sin nombre'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Detalles del Usuario</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-2 py-4">
                                    {renderUserDetail("Nombre Completo", user.displayName)}
                                    {renderUserDetail("Email", user.email)}
                                    {renderUserDetail("Rol", user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                                    {renderUserDetail("CI", user.ci)}
                                    {renderUserDetail("Teléfono", user.numero)}
                                    {renderUserDetail("Usuario", user.usuario)}
                                    {renderUserDetail("Universidad", user.universidad)}
                                    {renderUserDetail("Fecha de registro", new Date(user.createdAt).toLocaleDateString('es-ES'))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteUser(user._id, user.displayName || user.email)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No se encontraron usuarios.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="item-4">
          <Card>
            <AccordionTrigger className="p-6">
              <div className="text-left">
                <CardTitle>Gestión de Entradas</CardTitle>
                <CardDescription className="mt-1">Administra y valida las entradas del sistema.</CardDescription>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black">Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell text-black">Entrada</TableHead>
                      <TableHead className="hidden md:table-cell text-black">Cantidad</TableHead>
                      <TableHead className="text-center text-black">Estado</TableHead>
                      <TableHead className="text-center text-black">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entradas.map((entrada) => (
                      <TableRow key={entrada._id}>
                        <TableCell>
                          <div className="font-medium">{entrada.userName}</div>
                          <div className="text-sm text-muted-foreground">{entrada.userEmail}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {entrada.nombreEntrada}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {entrada.quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getEstadoBadgeVariant(entrada.estado)}>
                            {entrada.estado === 'enable' ? 'Activa' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            {entrada.estado === 'disable' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateEntradaStatus(entrada._id, 'enable')}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                Habilitar
                              </Button>
                            )}
                            {entrada.estado === 'enable' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateEntradaStatus(entrada._id, 'disable')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Deshabilitar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {entradas.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-black">
                    No hay entradas registradas
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


//Ubicacion src/app/dashboard/admin
/* Error
  [{
	"resource": "/c:/Users/arieel/Desktop/web/src/app/dashboard/admin/page.tsx",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module './add_user_form' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 45,
	"startColumn": 25,
	"endLineNumber": 45,
	"endColumn": 42,
	"origin": "extHost1"
}]
*/