"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Users, Ticket, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { BanknoteIcon } from '@/components/icons/banknote-icon';
import { RecentSales } from '@/components/dashboard/recent-sales';

interface Stats {
  totalUsers: number;
  pendingOrders: number;
  soldTickets: number;
  totalRevenue: number;
  manualTickets?: number; // Entradas generadas manualmente
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      // Redirección según el rol
      if (user.role === 'validador') {
        router.replace('/dashboard/orders');
      } else if (user.role === 'organizador') {
        router.replace('/dashboard/organizer');
      } else if (user.role === 'admin') {
        // El admin se queda aquí, así que carga los datos
        const fetchStats = async () => {
          try {
            const statsResponse = await fetch('/api/dashboard/stats');
            if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats');
            const statsData = await statsResponse.json();
            setStats(statsData);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
        fetchStats();
      }
    }
  }, [user, authLoading, router]);

  // Si no es admin, muestra un loader mientras redirige
  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Vista solo para Admin
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Resumen del Evento
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes una vista general de la actividad.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">Gs. {stats?.totalRevenue.toLocaleString('es-PY') ?? 0}</div>}
            <p className="text-xs text-muted-foreground">
              * Ingresos de entradas confirmadas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Vendidas</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.soldTickets ?? 0}</div>}
            <p className="text-xs text-muted-foreground">
              Total de entradas verificadas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>}
            <p className="text-xs text-muted-foreground">
              Usuarios registrados en el sistema.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificaciones Pendientes</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.pendingOrders ?? 0}</div>}
            <p className="text-xs text-muted-foreground">
              Entradas por aceptar.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Generadas</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats?.manualTickets ?? 0}</div>}
            <p className="text-xs text-muted-foreground">
              Entradas generadas manualmente.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <RecentSales />
    </div>
  );
}