
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Check, X, Eye, Loader2 } from 'lucide-react';

interface Order {
    id: string;
    userName: string;
    totalPrice: number;
    receiptUrl: string;
    createdAt: Timestamp;
    status: "pending" | "verified" | "rejected";
}

export default function ValidatorDashboard() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "==", "pending"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
            ordersData.push({ id: doc.id, ...doc.data() } as Order);
        });
        setPendingOrders(ordersData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching pending orders: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar las órdenes pendientes."
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleUpdateStatus = async (orderId: string, status: "verified" | "rejected") => {
    setUpdatingId(orderId);
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: status });
        toast({
            title: "Orden Actualizada",
            description: `La orden ha sido marcada como ${status === 'verified' ? 'verificada' : 'rechazada'}.`,
        });
    } catch (error) {
        console.error("Error updating order status: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar la orden."
        });
    } finally {
        setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Validador</h1>
        <p className="text-muted-foreground">
          Verifica pagos y gestiona la venta de entradas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verificaciones Pendientes</CardTitle>
          <CardDescription>
            Revisa las siguientes transacciones y verifica su estado de pago.
          </CardDescription>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.userName}
                      </TableCell>
                       <TableCell>
                        {order.createdAt.toDate().toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="text-right">
                        Gs. {order.totalPrice.toLocaleString('es-PY')}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Eye className="mr-2 h-4 w-4" /> Ver Comprobante
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Comprobante de {order.userName}</DialogTitle>
                                </DialogHeader>
                                <div className="relative mt-4 h-96 w-full">
                                    <Image 
                                        src={order.receiptUrl} 
                                        alt={`Comprobante de ${order.userName}`}
                                        layout="fill"
                                        objectFit="contain"
                                    />
                                </div>
                                <DialogFooter className="mt-4 sm:justify-between gap-2">
                                     <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Cerrar
                                        </Button>
                                    </DialogClose>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="destructive"
                                            onClick={() => handleUpdateStatus(order.id, 'rejected')}
                                            disabled={updatingId === order.id}
                                        >
                                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />} Rechazar
                                        </Button>
                                        <Button 
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleUpdateStatus(order.id, 'verified')}
                                            disabled={updatingId === order.id}
                                        >
                                           {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />} Aprobar
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No hay pagos pendientes para verificar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
