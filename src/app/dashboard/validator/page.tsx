
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
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp, getDocs, writeBatch } from 'firebase/firestore';
import { Check, X, Eye, Loader2 } from 'lucide-react';

interface Order {
    id: string;
    userId: string;
    userName: string;
    totalPrice: number;
    receiptUrl: string;
    createdAt: Timestamp;
    status: "pending" | "verified" | "rejected";
    quantity: number;
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
        setPendingOrders(ordersData.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()));
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

  const handleUpdateStatus = async (order: Order, newStatus: "verified" | "rejected") => {
    setUpdatingId(order.id);
    try {
        const batch = writeBatch(db);
        const orderRef = doc(db, "orders", order.id);
        batch.update(orderRef, { status: newStatus });

        if (newStatus === 'verified') {
            // Find the user's ticket and enable it
            const ticketsRef = collection(db, "tickets");
            const q = query(ticketsRef, where("userId", "==", order.userId), where("status", "==", "disabled"));
            const ticketSnapshot = await getDocs(q);

            if (!ticketSnapshot.empty) {
                // Assuming one ticket document per user for this event logic
                 const ticketDoc = ticketSnapshot.docs[0];
                 const ticketRef = doc(db, "tickets", ticketDoc.id);
                 batch.update(ticketRef, { 
                    status: "enabled",
                    enabledAt: new Date(),
                    orderId: order.id,
                });
            } else {
                 throw new Error(`No se encontró un ticket deshabilitado para el usuario ${order.userName}.`);
            }
        }
        
        await batch.commit();

        toast({
            title: "Orden Actualizada",
            description: `La orden ha sido marcada como ${newStatus === 'verified' ? 'verificada' : 'rechazada'}.`,
        });

    } catch (error: any) {
        console.error("Error updating order status: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "No se pudo actualizar la orden."
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
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Cantidad</TableHead>
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
                       <TableCell className="hidden sm:table-cell">
                        {order.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                       <TableCell className="hidden md:table-cell text-center">
                        {order.quantity}
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
                                            onClick={() => handleUpdateStatus(order, 'rejected')}
                                            disabled={updatingId === order.id}
                                        >
                                            {updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4" />} Rechazar
                                        </Button>
                                        <Button 
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleUpdateStatus(order, 'verified')}
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
                    <TableCell colSpan={5} className="text-center h-24">
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
