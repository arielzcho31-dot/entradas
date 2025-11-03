"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Ticket, Download, RefreshCw, X, Search, Filter } from 'lucide-react';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TicketDesign } from '@/components/tickets/ticket-design';

// Define la interfaz para el Ticket
interface MyTicket {
  id: string;
  ticket_name: string;
  createdAt: string;
  status: 'verified' | 'used';
  order_id: string;
  user_name?: string; // Añade user_name como opcional
}

// Define la interfaz para la Orden Agrupada
interface GroupedOrder {
  order_id: string;
  ticket_name: string;
  createdAt: string;
  tickets: MyTicket[];
  user_name?: string; // Añade user_name como opcional
}

// Define la interfaz para las órdenes pendientes
interface PendingOrder {
  id: string;
  ticket_name: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  receipt_url: string;
  created_at: string;
  event_id: string;
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<MyTicket[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { toast } = useToast();
  const userId = user?.id;
  const renderedTicketsCount = useRef(0);

  const fetchTickets = useCallback(async () => {
    if (!userId) {
      setTickets([]);
      setPendingOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      // Cargar tickets verificados
      const ticketsResponse = await fetch(`/api/tickets?userId=${userId}`);
      if (!ticketsResponse.ok) throw new Error('Failed to fetch tickets');
      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData || []);

      // Cargar órdenes pendientes/aprobadas/rechazadas
      const ordersResponse = await fetch(`/api/orders?userId=${userId}`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        // Filtrar solo órdenes que no tienen tickets verificados aún
        const filteredOrders = ordersData.filter((order: PendingOrder) => 
          order.status !== 'cancelled'
        );
        setPendingOrders(filteredOrders || []);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudieron cargar tus entradas.');
      setTickets([]);
      setPendingOrders([]);
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // TODOS LOS useMemo DEBEN IR ANTES DE useEffect
  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: GroupedOrder } = {};
    tickets.forEach(ticket => {
      if (!groups[ticket.order_id]) {
        groups[ticket.order_id] = {
          order_id: ticket.order_id,
          ticket_name: ticket.ticket_name,
          createdAt: ticket.createdAt,
          user_name: ticket.user_name,
          tickets: [],
        };
      }
      groups[ticket.order_id].tickets.push(ticket);
    });
    return Object.values(groups);
  }, [tickets]);

  // Filtrar órdenes pendientes
  const filteredPendingOrders = useMemo(() => {
    let filtered = [...pendingOrders];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.ticket_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
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
    }

    return filtered;
  }, [pendingOrders, searchTerm, statusFilter, dateFilter]);

  // Filtrar tickets verificados
  const filteredGroupedOrders = useMemo(() => {
    let filtered = [...groupedOrders];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.ticket_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
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
    }

    return filtered;
  }, [groupedOrders, searchTerm, dateFilter]);

  useEffect(() => {
    if (!authLoading) {
      fetchTickets();
    }
  }, [authLoading, fetchTickets]);

  const generatePdf = async (orderId: string) => {
    const input = document.getElementById('pdf-render-area');
    if (!input) {
      toast({ variant: "destructive", title: "Error", description: "No se encontró el contenido para generar el PDF." });
      return;
    }

    try {
      const ticketElements = Array.from(input.children);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < ticketElements.length; i++) {
        if (i > 0) pdf.addPage();
        const ticketCanvas = await html2canvas(ticketElements[i] as HTMLElement, { 
          scale: 2, 
          backgroundColor: null,
          useCORS: true
        });
        const imgData = ticketCanvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }

      pdf.save(`entradas-${orderId}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar el PDF." });
    } finally {
      setDownloading(null);
      setPdfContent([]);
    }
  };

  const handleDownloadPdf = (ticketsToDownload: MyTicket[], downloadId: string) => {
    setDownloading(downloadId);
    renderedTicketsCount.current = 0;
    setPdfContent(ticketsToDownload);
  };

  const handleTicketRendered = (fileName: string, totalTickets: number) => {
    renderedTicketsCount.current += 1;
    if (renderedTicketsCount.current === totalTickets) {
      generatePdf(fileName);
    }
  };

  const getOrderStatus = (order: GroupedOrder) => {
    const allUsed = order.tickets.every(t => t.status === 'used');
    return allUsed
      ? { text: 'Utilizada', variant: 'destructive' as const }
      : { text: 'Válida', variant: 'default' as const };
  };

  const downloadApprovedOrderPDF = async (order: PendingOrder) => {
    setDownloading(order.id);
    try {
      // Obtener los tickets de esta orden
      const ticketsRes = await fetch(`/api/tickets?orderId=${order.id}`);
      if (!ticketsRes.ok) throw new Error('No se pudieron cargar los tickets');
      
      const orderTickets = await ticketsRes.json();
      
      if (orderTickets.length === 0) {
        toast({
          variant: "destructive",
          title: "Sin tickets",
          description: "Esta orden aún no tiene tickets generados.",
        });
        setDownloading(null);
        return;
      }

      // Usar la función existente para generar el PDF
      renderedTicketsCount.current = 0;
      setPdfContent(orderTickets);
    } catch (error) {
      console.error("Error descargando tickets:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron descargar los tickets.",
      });
      setDownloading(null);
    }
  };

  const getPendingOrderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', variant: 'secondary' as const, description: 'Tu comprobante está siendo revisado' };
      case 'approved':
        return { text: 'Aprobada', variant: 'default' as const, description: 'Tu pago fue verificado. Tus entradas están siendo generadas.' };
      case 'rejected':
        return { text: 'Rechazada', variant: 'destructive' as const, description: 'El comprobante no pudo ser verificado' };
      default:
        return { text: status, variant: 'outline' as const, description: '' };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Entradas</h1>
          <p className="text-muted-foreground">
            Aquí están tus entradas agrupadas por compra. Haz clic en una para ver los códigos QR.
          </p>
        </div>
        <Button onClick={fetchTickets} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre de entrada..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-blue-500 text-base font-medium bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] border-2 font-medium text-base bg-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">Todos los estados</SelectItem>
                <SelectItem value="pending" className="font-medium">Pendiente</SelectItem>
                <SelectItem value="approved" className="font-medium">Aprobada</SelectItem>
                <SelectItem value="rejected" className="font-medium">Rechazada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px] border-2 font-medium text-base bg-white">
                <SelectValue placeholder="Fecha" />
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

      {/* Sección de Órdenes Pendientes/Aprobadas/Rechazadas */}
      {filteredPendingOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Compras en Proceso
            <span className="text-muted-foreground font-normal text-lg ml-2">
              ({filteredPendingOrders.length})
            </span>
          </h2>
          <div className="grid gap-4">
            {filteredPendingOrders.map((order) => {
              const statusInfo = getPendingOrderStatus(order.status);
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {order.ticket_name}
                          <span className="text-muted-foreground font-normal ml-2">(x{order.quantity})</span>
                        </CardTitle>
                        <CardDescription>
                          Orden del: {new Date(order.created_at).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-muted-foreground">{statusInfo.description}</p>
                      <p className="font-semibold">
                        Total: Gs. {order.total_price.toLocaleString('es-PY')}
                      </p>
                      <div className="flex gap-2 items-center flex-wrap">
                        {order.receipt_url && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={() => setSelectedReceipt(order.receipt_url)}
                          >
                            Ver comprobante →
                          </Button>
                        )}
                        {order.status === 'approved' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => downloadApprovedOrderPDF(order)}
                            disabled={downloading === order.id}
                          >
                            {downloading === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Descargar Entradas
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay entradas ni órdenes */}
      {pendingOrders.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardHeader>
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No tienes órdenes</CardTitle>
            <CardDescription>
              Cuando compres entradas para un evento, aparecerán aquí.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Ya no mostramos la sección de entradas verificadas */}
      {false && tickets.length > 0 && user?.role === 'user' ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Entradas Verificadas
            <span className="text-muted-foreground font-normal text-lg ml-2">
              ({filteredGroupedOrders.length})
            </span>
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredGroupedOrders.map((order) => {
            const orderStatus = getOrderStatus(order);
            return (
              <AccordionItem value={order.order_id} key={order.order_id} className="border rounded-lg">
                <div className="flex items-center p-4">
                  <AccordionTrigger className="flex-1 text-left p-0 hover:no-underline">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {order.ticket_name}
                        <span className="text-muted-foreground font-normal ml-2">(x{order.tickets.length})</span>
                        <Badge variant={orderStatus.variant} className="ml-3">{orderStatus.text}</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Compra del: {new Date(order.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <Button onClick={() => handleDownloadPdf(order.tickets, order.order_id)} disabled={!!downloading} size="sm" className="ml-4">
                    {downloading === order.order_id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                </div>
                <AccordionContent>
                  {/* Ya no se necesita el contenedor oculto aquí */}
                  {/* Vista previa visible para el usuario */}
                  <div className="p-4 pt-0">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {order.tickets.map((ticket) => (
                        <div key={ticket.id} className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                          <div className="bg-white p-2 rounded-lg">
                            <QRCode value={ticket.id} size={128} />
                          </div>
                          <div className="text-center">
                            <Badge variant={ticket.status === 'used' ? 'destructive' : 'default'}>
                              {ticket.status === 'used' ? 'Utilizada' : 'Válida'}
                            </Badge>
                            <p className="text-xs text-muted-foreground break-all mt-2">
                              ID: {ticket.id}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        </div>
      ) : tickets.length > 0 ? (
        // Vista para roles que no son 'user'
        <div>
          <Button onClick={() => handleDownloadPdf(tickets, 'todas-mis-entradas')} disabled={!!downloading} size="lg" className="w-full md:w-auto mb-8">
            {downloading === 'todas-mis-entradas' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar Todas Mis Entradas (PDF)
          </Button>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                <div className="bg-white p-2 rounded-lg">
                  <QRCode value={ticket.id} size={128} />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{ticket.ticket_name}</p>
                  <Badge variant={ticket.status === 'used' ? 'destructive' : 'default'} className="mt-1">
                    {ticket.status === 'used' ? 'Utilizada' : 'Válida'}
                  </Badge>
                  <p className="text-xs text-muted-foreground break-all mt-2">
                    ID: {ticket.id}
                  </p>
                </div>
                <Button onClick={() => handleDownloadPdf([ticket], ticket.id)} disabled={!!downloading} size="sm" variant="outline" className="w-full mt-2">
                  {downloading === ticket.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Modal para ver comprobante */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comprobante de Transferencia</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[70vh] flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden">
            {selectedReceipt && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedReceipt}
                alt="Comprobante de pago"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contenedor invisible para renderizar el PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
        <div id="pdf-render-area">
          {pdfContent.map((ticket) => (
            <TicketDesign
              key={ticket.id}
              ticketId={ticket.id}
              eventName={
                <>
                  <span style={{ color: '#ec4899' }}>UNIDA</span>
                  <span style={{ color: '#ffffff' }}>FEST 2025</span>
                </>
              }
              ticketName={ticket.ticket_name}
              userName={ticket.user_name}
              onRendered={() => handleTicketRendered(downloading || 'entradas', pdfContent.length)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}