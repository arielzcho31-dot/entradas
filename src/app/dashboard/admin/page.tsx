
"use client";

import { useState, useEffect } from 'react';
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
import type { User as UserData } from '@/lib/placeholder-data';
import { Users, Ticket, BarChart, Banknote, Loader2, RefreshCw, Search } from 'lucide-react';
import AddUserForm from '@/components/admin/add-user-form';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs, query, where, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

// Extending User type to include optional fields from Firestore
interface User extends UserData {
    ci?: string;
    numero?: string;
    usuario?: string;
    universidad?: string;
}

interface Sale {
    id: string;
    customerName: string;
    eventName: string;
    saleDate: Date;
    totalPrice: number;
}

export default function AdminDashboard() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    
    // Fetch Users
    const usersCollectionRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersCollectionRef, (snapshot) => {
      const usersData: User[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName,
        email: doc.data().email,
        role: doc.data().role,
        ci: doc.data().ci,
        numero: doc.data().numero,
        usuario: doc.data().usuario,
        universidad: doc.data().universidad,
      }));
      setUsers(usersData);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: usersCollectionRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    // Fetch Verified Orders for stats
    const verifiedOrdersQuery = query(collection(db, "orders"), where("status", "==", "verified"));
    const unsubscribeOrders = onSnapshot(verifiedOrdersQuery, (snapshot) => {
        let salesSum = 0;
        let ticketsSum = 0;
        snapshot.forEach(doc => {
            salesSum += doc.data().totalPrice;
            ticketsSum += doc.data().quantity;
        });
        setTotalSales(salesSum);
        setTotalTicketsSold(ticketsSum);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'orders',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    // Fetch Recent Sales
    const recentSalesQuery = query(collection(db, "orders"), where("status", "==", "verified"), limit(5));
     const unsubscribeRecentSales = onSnapshot(recentSalesQuery, (snapshot) => {
        const salesData: Sale[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                customerName: data.userName,
                eventName: data.ticketName, 
                saleDate: data.createdAt.toDate(),
                totalPrice: data.totalPrice,
            };
        });
        // Sort in client
        salesData.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());
        setRecentSales(salesData);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'orders',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
      unsubscribeRecentSales();
    };
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Re-fetch users
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const usersData: User[] = userSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName,
        email: doc.data().email,
        role: doc.data().role,
        ci: doc.data().ci,
        numero: doc.data().numero,
        usuario: doc.data().usuario,
        universidad: doc.data().universidad,
      }));
      setUsers(usersData);
      
       // Re-fetch stats
      const verifiedOrdersQuery = query(collection(db, "orders"), where("status", "==", "verified"));
      const ordersSnapshot = await getDocs(verifiedOrdersQuery);
      let salesSum = 0;
      let ticketsSum = 0;
      ordersSnapshot.forEach(doc => {
          salesSum += doc.data().totalPrice;
          ticketsSum += doc.data().quantity;
      });
      setTotalSales(salesSum);
      setTotalTicketsSold(ticketsSum);

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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'validator':
        return 'secondary';
      case 'organizer':
        return 'outline';
      default:
        return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesRole && matchesEmail;
  });

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Solo un evento disponible.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados en el sistema.</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={['item-3']} className="w-full space-y-6">
        <AccordionItem value="item-1">
           <Card>
            <AccordionTrigger className="p-6">
                <div className="text-left">
                  <CardTitle>Ventas Verificadas Recientes</CardTitle>
                  <CardDescription className="mt-1">Una lista de las transacciones más recientes.</CardDescription>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden sm:table-cell">Entrada</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            <div className="font-medium">{sale.customerName}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {sale.eventName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(sale.saleDate).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell className="text-right">Gs. {sale.totalPrice.toLocaleString('es-PY')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  <AddUserForm />
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
                                    <SelectItem value="validator">Validador</SelectItem>
                                    <SelectItem value="organizer">Organizador</SelectItem>
                                    <SelectItem value="customer">Cliente</SelectItem>
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
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="text-right">Rol</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link" className="p-0 h-auto font-medium text-card-foreground hover:text-primary">
                                            {user.name}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Detalles del Usuario</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-2 py-4">
                                            {renderUserDetail("Nombre Completo", user.name)}
                                            {renderUserDetail("Email", user.email)}
                                            {renderUserDetail("Rol", user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                                            {renderUserDetail("CI", user.ci)}
                                            {renderUserDetail("Teléfono", user.numero)}
                                            {renderUserDetail("Usuario", user.usuario)}
                                            {renderUserDetail("Universidad", user.universidad)}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                            <TableCell className="text-right">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                )}
                </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
