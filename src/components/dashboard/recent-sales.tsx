"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import QRCode from 'qrcode.react';

interface RecentSale {
  id: string;
  userName: string;
  createdAt: string;
  totalPrice: number;
  quantity: number;
}

interface TicketInfo {
  id: string;
}

export function RecentSales() {
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<RecentSale | null>(null);
  const [saleTickets, setSaleTickets] = useState<TicketInfo[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesResponse = await fetch('/api/dashboard/recent-sales');
        if (!salesResponse.ok) throw new Error('Failed to fetch recent sales');
        const salesData = await salesResponse.json();
        setRecentSales(salesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const handleSaleClick = async (sale: RecentSale) => {
    setSelectedSale(sale);
    setLoadingTickets(true);
    try {
      const response = await fetch(`/api/orders/${sale.id}/tickets`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setSaleTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTickets(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ventas Verificadas Recientes</CardTitle>
          <CardDescription>
            Haz clic en una venta para ver los códigos QR de las entradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <TableRow key={sale.id} onClick={() => handleSaleClick(sale)} className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{sale.userName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(sale.createdAt).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      Gs. {sale.totalPrice.toLocaleString('es-PY')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No hay ventas recientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Entradas de {selectedSale?.userName}</DialogTitle>
            <CardDescription>
              Total de entradas compradas: {selectedSale?.quantity}
            </CardDescription>
          </DialogHeader>
          {loadingTickets ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-4">
              {saleTickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col items-center gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCode value={ticket.id} size={128} />
                  </div>
                  <p className="text-xs text-muted-foreground break-all">{ticket.id}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
