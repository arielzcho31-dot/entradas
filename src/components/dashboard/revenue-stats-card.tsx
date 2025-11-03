"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RevenueStats {
  ordenes_pendientes: number;
  ordenes_aprobadas: number;
  ordenes_rechazadas: number;
  ingresos_pendientes: number;
  ingresos_aprobados: number;
  ingresos_rechazados: number;
  total_ordenes: number;
  ingresos_totales: number;
}

interface RevenueStatsCardProps {
  userId?: string;
  eventId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // en milisegundos, default 30000 (30 segundos)
}

export function RevenueStatsCard({ 
  userId, 
  eventId = 'all',
  autoRefresh = false,
  refreshInterval = 30000 
}: RevenueStatsCardProps) {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      if (eventId) params.set('eventId', eventId);

      const response = await fetch(`/api/organizer/stats?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh si está habilitado
    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userId, eventId, autoRefresh, refreshInterval]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PY', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando estadísticas...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Ingresos Aprobados (Verde) */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardDescription className="text-green-700">Ingresos Confirmados</CardDescription>
          <CardTitle className="text-3xl text-green-900">
            {formatCurrency(stats?.ingresos_aprobados || 0)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-600">
            {stats?.ordenes_aprobadas || 0} órdenes aprobadas
          </div>
        </CardContent>
      </Card>

      {/* Ingresos Pendientes (Amarillo) */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardDescription className="text-yellow-700">Pendiente de Aprobación</CardDescription>
          <CardTitle className="text-3xl text-yellow-900">
            {formatCurrency(stats?.ingresos_pendientes || 0)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-600">
            {stats?.ordenes_pendientes || 0} órdenes pendientes
          </div>
        </CardContent>
      </Card>

      {/* Total (Azul) */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardDescription className="text-blue-700">Total de Órdenes</CardDescription>
          <CardTitle className="text-3xl text-blue-900">
            {formatCurrency(stats?.ingresos_totales || 0)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-600">
            {stats?.total_ordenes || 0} órdenes totales
          </div>
        </CardContent>
      </Card>

      {/* Footer con última actualización y botón de refresh */}
      <div className="col-span-full flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Última actualización: {formatTime(lastUpdate)}
          {autoRefresh && ` (auto-refresh cada ${refreshInterval / 1000}s)`}
        </span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
    </div>
  );
}
