"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Filter } from 'lucide-react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RecentSale {
  id: string;
  userName: string;
  createdAt: string;
  totalPrice: number;
  quantity: number;
  eventName?: string;
  eventId?: string;
}

interface TicketInfo {
  id: string;
}

interface Event {
  id: string;
  name: string;
}

export function RecentSales() {
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [filteredSales, setFilteredSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<RecentSale | null>(null);
  const [saleTickets, setSaleTickets] = useState<TicketInfo[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar eventos
        const eventsRes = await fetch('/api/events');
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }

        // Cargar ventas
        const salesResponse = await fetch('/api/orders?status=approved');
        if (!salesResponse.ok) throw new Error('Failed to fetch recent sales');
        const salesData = await salesResponse.json();
        
        // Transformar datos si es necesario
        const formattedSales = Array.isArray(salesData) ? salesData.map((sale: any) => ({
          id: sale.id,
          userName: sale.user_name || 'Usuario Desconocido',
          createdAt: sale.created_at,
          totalPrice: sale.total_price || 0,
          quantity: sale.quantity || 0,
          eventName: sale.event_name || 'Sin evento',
          eventId: sale.event_id,
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10) : [];
        
        setRecentSales(formattedSales);
        setFilteredSales(formattedSales);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent === 'all') {
      setFilteredSales(recentSales);
    } else {
      setFilteredSales(recentSales.filter(sale => sale.eventId === selectedEvent));
    }
  }, [selectedEvent, recentSales]);

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

  // No mostrar el componente si no hay ventas
  if (!loading && recentSales.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ventas Verificadas Recientes</CardTitle>
              <CardDescription>
                Últimas {recentSales.length} ventas aprobadas
              </CardDescription>
            </div>
            {events.length > 0 && (
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Evento</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} onClick={() => handleSaleClick(sale)} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium">{sale.userName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-gray-600">
                      {sale.eventName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(sale.createdAt).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      Gs. {sale.totalPrice.toLocaleString('es-PY')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedEvent === 'all' 
                  ? 'No hay ventas verificadas recientes.' 
                  : 'No hay ventas para este evento.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Entradas de {selectedSale?.userName}</DialogTitle>
            <CardDescription>
              Evento: {selectedSale?.eventName} | Total de entradas: {selectedSale?.quantity}
            </CardDescription>
          </DialogHeader>
          {loadingTickets ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : saleTickets.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay entradas para esta compra.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
