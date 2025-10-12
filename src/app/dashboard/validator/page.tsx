"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, RefreshCw, Ticket, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Input } from '@/components/ui/input'; // Importa el componente Input
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ReceiptPreview from '@/components/validator/receipt-preview';

// Define la interfaz para las órdenes
interface Order {
  id: string;
  userName: string;
  userEmail: string;
  quantity: number;
  totalPrice: number;
  receiptUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  // Añade los campos necesarios para crear tickets
  userId: string;
  ticketName: string;
}

export default function ValidatorDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState(''); // Estado para el filtro
  const { toast } = useToast();

  // Función para obtener las órdenes pendientes
  const fetchPendingOrders = async () => {
    setLoading(true);
    // Selecciona explícitamente las columnas necesarias
    const { data, error } = await supabase
      .from('orders')
      .select('id, userName, userEmail, quantity, totalPrice, receiptUrl, status, createdAt, userId, ticketName')
      .eq('status', 'pending')
      .order('createdAt', { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las órdenes pendientes.",
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // Función para actualizar el estado de una orden
  const handleUpdateStatus = async (order: Order, newStatus: 'verified' | 'rejected') => {
    setUpdatingId(order.id);

    if (newStatus === 'verified') {
      // Si se aprueba, crea los tickets individuales
      const ticketsToCreate = Array.from({ length: order.quantity }).map(() => ({
        order_id: order.id,
        user_id: order.userId,
        user_name: order.userName,
        ticket_name: order.ticketName,
        status: 'verified',
      }));

      const { error: ticketsError } = await supabase.from('tickets').insert(ticketsToCreate);

      if (ticketsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron generar los tickets." });
        setUpdatingId(null);
        return;
      }
    }

    // Actualiza el estado de la orden principal
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (orderError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la orden.",
      });
    } else {
      toast({
        title: "Orden actualizada",
        description: `La orden ha sido marcada como ${newStatus}.`,
      });
      // Actualiza la lista de órdenes para remover la que fue actualizada
      setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
    }
    setUpdatingId(null);
  };

  // Filtra las órdenes según el texto del input
  const filteredOrders = orders.filter(order =>
    order.userName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aprobar Órdenes</h1>
          <p className="text-muted-foreground">Aprueba o rechaza las órdenes con comprobante subido.</p>
        </div>
        <Button onClick={fetchPendingOrders} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No hay órdenes pendientes</CardTitle>
            <CardDescription>
              Cuando los usuarios suban comprobantes, aparecerán aquí para aprobar o rechazar.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map(order => (
            <Card key={order.id} className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
              <div className="flex-1 flex flex-col items-start w-full md:w-auto">
                <CardTitle className="mb-2">{order.userName}</CardTitle>
                <div className="text-muted-foreground text-sm mb-2">{order.userEmail}</div>
                <div className="text-sm">Cantidad: {order.quantity}</div>
                <div className="text-sm">Total: Gs. {(typeof order.totalPrice === 'number' ? order.totalPrice : 0).toLocaleString('es-PY')}</div>
                <div className="text-xs text-muted-foreground mt-2">Fecha: {new Date(order.createdAt).toLocaleString('es-ES')}</div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                <ReceiptPreview src={order.receiptUrl} alt="Comprobante" />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(order, 'verified')} disabled={updatingId === order.id}>
                    {updatingId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(order, 'rejected')} disabled={updatingId === order.id}>
                    {updatingId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />} Rechazar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}