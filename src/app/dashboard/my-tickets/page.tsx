"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, Download, RefreshCw } from 'lucide-react';
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

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<MyTicket[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();
  const userId = user?.id;
  const renderedTicketsCount = useRef(0);

  const fetchTickets = useCallback(async () => {
    if (!userId) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_name, createdAt, status, order_id, user_name')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudieron cargar tus entradas.');
      setTickets([]);
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      fetchTickets();
    }
  }, [authLoading, fetchTickets]);

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: GroupedOrder } = {};
    tickets.forEach(ticket => {
      if (!groups[ticket.order_id]) {
        groups[ticket.order_id] = {
          order_id: ticket.order_id,
          ticket_name: ticket.ticket_name,
          createdAt: ticket.createdAt,
          user_name: ticket.user_name, // Asigna el nombre de usuario
          tickets: [],
        };
      }
      groups[ticket.order_id].tickets.push(ticket);
    });
    return Object.values(groups);
  }, [tickets]);

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

      {tickets.length === 0 && !loading ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No tienes entradas</CardTitle>
            <CardDescription>
              Cuando compres entradas para un evento, aparecerán aquí.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : user?.role === 'customer' ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {groupedOrders.map((order) => {
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
      ) : (
        // Vista para roles que no son 'customer'
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
      )}

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