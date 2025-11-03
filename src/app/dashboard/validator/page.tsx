"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, RefreshCw, Check, X, Calendar, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RevenueStatsCard } from '@/components/dashboard/revenue-stats-card';
import { useAuth } from '@/context/auth-context';

interface Order {
  id: string;
  user_name: string | null;
  user_email: string | null;
  quantity: number;
  total_price: number;
  receipt_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string | null;
  ticket_name: string | null;
  event_name?: string | null;
  event_id?: string | null;
}

interface Event {
  id: string;
  name: string;
}

export default function ValidatorDashboard() {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<Order[]>([]);
  const [rejectedOrders, setRejectedOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    try {
      // Cargar todas las órdenes
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();

      // Cargar eventos únicos de las órdenes
      const uniqueEvents = Array.from(
        new Map(
          data
            .filter((o: Order) => o.event_id && o.event_name)
            .map((o: Order) => [o.event_id, { id: o.event_id!, name: o.event_name! }])
        ).values()
      ) as Event[];
      setEvents(uniqueEvents);

      // Filtrar órdenes sin tickets generados (excluir entradas gratuitas que ya tienen tickets)
      const ordersNeedingApproval = data.filter((o: Order) => {
        // Si es aprobada, solo mostrar si NO tiene tickets generados aún
        if (o.status === 'approved' && o.total_price === 0) {
          return false; // Entradas gratuitas ya procesadas
        }
        return true;
      });

      // Separar por estado
      setPendingOrders(ordersNeedingApproval.filter((o: Order) => o.status === 'pending'));
      setApprovedOrders(ordersNeedingApproval.filter((o: Order) => o.status === 'approved'));
      setRejectedOrders(ordersNeedingApproval.filter((o: Order) => o.status === 'rejected'));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las órdenes.",
      });
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (order: Order, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(order.id);
    try {
      // Si se aprueba, crear tickets PRIMERO
      if (newStatus === 'approved') {
        const ticketsResponse = await fetch(`/api/orders/${order.id}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: order.quantity,
          }),
        });

        if (!ticketsResponse.ok) {
          const errorData = await ticketsResponse.json();
          console.error('Failed to create tickets:', errorData);
          throw new Error(errorData.error || 'Error al generar tickets');
        }

        const ticketsData = await ticketsResponse.json();
        console.log('Tickets creados:', ticketsData);
      }

      // Luego actualizar el estado
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      toast({
        title: "Éxito",
        description: `Orden ${newStatus === 'approved' ? 'aprobada y tickets generados' : 'rechazada'} correctamente.`,
      });

      loadAllOrders();
    } catch (error: any) {
      console.error('Error en handleUpdateStatus:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el estado de la orden.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filterByDate = (orders: Order[]) => {
    if (dateFilter === 'all') return orders;

    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      switch (dateFilter) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filterByName = (orders: Order[]) => {
    if (!filter) return orders;
    return orders.filter((order) =>
      order.user_name?.toLowerCase().includes(filter.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const filterByEvent = (orders: Order[]) => {
    if (selectedEvent === 'all') return orders;
    return orders.filter((order) => order.event_id === selectedEvent);
  };

  const applyFilters = (orders: Order[]) => {
    return filterByEvent(filterByName(filterByDate(orders)));
  };

  const OrderTable = ({ orders, showActions = false }: { orders: Order[], showActions?: boolean }) => (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay órdenes en esta categoría
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {order.user_name || 'Usuario sin nombre'}
                    </h3>
                    <Badge variant={
                      order.status === 'approved' ? 'default' :
                      order.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {order.status === 'approved' ? 'Aprobada' :
                       order.status === 'rejected' ? 'Rechazada' :
                       'Pendiente'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{order.user_email}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Entrada:</span> {order.ticket_name || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Cantidad:</span> {order.quantity}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> Gs. {order.total_price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(order.created_at).toLocaleString('es-PY')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  {order.receipt_url && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(order.receipt_url)} className="border-blue-500 text-blue-600 hover:bg-blue-50">
                          Ver Comprobante
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <div className="flex flex-col items-center gap-4">
                          <h3 className="text-lg font-semibold">Comprobante de Pago</h3>
                          <img
                            src={order.receipt_url}
                            alt="Comprobante"
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {showActions && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUpdateStatus(order, 'approved')}
                        disabled={updatingId === order.id}
                        className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updatingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateStatus(order, 'rejected')}
                        disabled={updatingId === order.id}
                        className="gap-1"
                      >
                        {updatingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const filteredPending = applyFilters(pendingOrders);
  const filteredApproved = applyFilters(approvedOrders);
  const filteredRejected = applyFilters(rejectedOrders);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Validación de Compras</h1>
          <p className="text-gray-600 mt-1">Aprueba o rechaza comprobantes de pago</p>
        </div>
        <Button onClick={loadAllOrders} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas de Ingresos con Auto-Refresh */}
      <RevenueStatsCard 
        userId={user?.id} 
        eventId={selectedEvent}
        autoRefresh={true}
        refreshInterval={30000}
      />

      {/* Filtro por evento */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Filtrar por evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los eventos</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Loader2 className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedOrders.length}</p>
                <p className="text-sm text-gray-600">Aprobadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedOrders.length}</p>
                <p className="text-sm text-gray-600">Rechazadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 border-2 border-blue-300 focus:border-blue-500 text-base font-medium bg-white"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[200px] border-2 border-blue-300 focus:ring-blue-500 font-medium text-base bg-white">
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">Todas las fechas</SelectItem>
                <SelectItem value="today" className="font-medium">Hoy</SelectItem>
                <SelectItem value="week" className="font-medium">Última semana</SelectItem>
                <SelectItem value="month" className="font-medium">Último mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Loader2 className="w-4 h-4" />
            Pendientes ({filteredPending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <CheckCircle className="w-4 h-4" />
            Aprobadas ({filteredApproved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <XCircle className="w-4 h-4" />
            Rechazadas ({filteredRejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <OrderTable orders={filteredPending} showActions={true} />
        </TabsContent>

        <TabsContent value="approved">
          <OrderTable orders={filteredApproved} showActions={false} />
        </TabsContent>

        <TabsContent value="rejected">
          <OrderTable orders={filteredRejected} showActions={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
