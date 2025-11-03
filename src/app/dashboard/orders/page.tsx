"use client";

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, RefreshCw, Ticket } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface Order {
  id: string;
  createdAt: string;
  user_name: string;
  user_email: string;
  ticket_name: string;
  quantity: number;
  total_price: number;
  receipt_url: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  ticketName: string;
  userName: string;
}

export default function ValidatorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/orders');
      const responseBody = await response.text();
      if (!response.ok) {
        const errorData = responseBody ? JSON.parse(responseBody) : { error: `Request failed with status ${response.status}` };
        setErrorMsg(errorData.error || 'Failed to fetch orders');
        setOrders([]);
        return;
      }
      const data = responseBody ? JSON.parse(responseBody) : [];
      setOrders(data || []);
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudieron cargar las órdenes.');
      setOrders([]);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleOrderAction = async (order: Order, newStatus: 'approved' | 'rejected') => {
    setActionLoading(order.id);
    try {
      if (newStatus === 'approved') {
        const ticketsResponse = await fetch(`/api/orders/${order.id}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: order.quantity }),
        });
        if (!ticketsResponse.ok) throw new Error('Error al generar tickets');
      }

      const updateResponse = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!updateResponse.ok) throw new Error('Error al actualizar orden');

      toast({ title: `Orden ${newStatus === 'approved' ? 'Aprobada' : 'Rechazada'}`, description: "El estado de la orden ha sido actualizado." });
      fetchOrders();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Solo mostrar órdenes pendientes
  const pendingOrders = orders.filter(order => order.status === 'pending');

  // Manejo de error y mensaje si no hay órdenes
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (errorMsg) {
    return (
      <div className="text-center py-10 text-destructive">
        {errorMsg}
      </div>
    );
  }
  if (!pendingOrders || pendingOrders.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No hay órdenes pendientes por verificar.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-destructive">
        No tienes permisos para ver esta sección.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes Pendientes</h1>
          <p className="text-muted-foreground">
            Revisa y valida los comprobantes subidos por los usuarios.
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>
      <div className="grid gap-6">
        {pendingOrders.map(order => (
          <Card key={order.id} className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
            <div className="flex-1 flex flex-col items-start w-full md:w-auto">
              <CardTitle className="mb-2">{order.user_name}</CardTitle>
              <div className="text-muted-foreground text-sm mb-2">{order.user_email}</div>
              <div className="text-sm">Cantidad: {order.quantity}</div>
              <div className="text-sm">Total: Gs. {(typeof order.total_price === 'number' ? order.total_price : 0).toLocaleString('es-PY')}</div>
              <div className="text-xs text-muted-foreground mt-2">Fecha: {new Date(order.createdAt).toLocaleString('es-ES')}</div>
            </div>
            <div className="flex flex-col items-center gap-2 w-full md:w-auto">
              <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="block">
                <img src={order.receipt_url} alt="Comprobante" className="max-w-[180px] max-h-[180px] rounded border object-contain" />
              </a>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleOrderAction(order, 'approved')} disabled={actionLoading === order.id}>
                  {actionLoading === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} Aprobar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleOrderAction(order, 'rejected')} disabled={actionLoading === order.id}>
                  {actionLoading === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />} Rechazar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}