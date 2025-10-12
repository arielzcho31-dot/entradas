"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TicketDesign } from '@/components/tickets/ticket-design';

// Interfaces
interface GeneratedTicket {
  id: string;
  ticket_name: string;
  createdAt: string;
}

interface GroupedBatch {
  batch_name: string;
  tickets: GeneratedTicket[];
}

export default function GeneratedTicketsPage() {
  const [tickets, setTickets] = useState<GeneratedTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<GeneratedTicket[]>([]);
  const { toast } = useToast();
  const renderedTicketsCount = useRef(0);

  const fetchGeneratedTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_name, createdAt')
        .is('user_id', null) // Obtiene tickets sin usuario asignado
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching generated tickets:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las entradas generadas." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGeneratedTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedBatches = useMemo(() => {
    const groups: { [key: string]: GroupedBatch } = {};
    tickets.forEach(ticket => {
      if (!groups[ticket.ticket_name]) {
        groups[ticket.ticket_name] = {
          batch_name: ticket.ticket_name,
          tickets: [],
        };
      }
      groups[ticket.ticket_name].tickets.push(ticket);
    });
    return Object.values(groups);
  }, [tickets]);

  const generatePdf = async (batchName: string) => {
    const input = document.getElementById(`pdf-render-area`);
    if (!input) {
      toast({ variant: "destructive", title: "Error", description: "No se encontró el contenido para generar el PDF." });
      return;
    }

    try {
      const ticketElements = Array.from(input.children);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < ticketElements.length; i++) {
        if (i > 0) pdf.addPage();
        const ticketCanvas = await html2canvas(ticketElements[i] as HTMLElement, { scale: 2, backgroundColor: null, useCORS: true });
        const imgData = ticketCanvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }

      pdf.save(`entradas-${batchName}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar el PDF." });
    } finally {
      setDownloading(null);
      setPdfContent([]);
    }
  };

  const handleDownloadPdf = (batch: GroupedBatch) => {
    setDownloading(batch.batch_name);
    renderedTicketsCount.current = 0;
    setPdfContent(batch.tickets);
  };

  const handleTicketRendered = (batchName: string, totalTickets: number) => {
    renderedTicketsCount.current += 1;
    if (renderedTicketsCount.current === totalTickets) {
      generatePdf(batchName);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entradas Generadas</h1>
          <p className="text-muted-foreground">
            Aquí están los lotes de entradas de cortesía o para invitados.
          </p>
        </div>
        <Button onClick={fetchGeneratedTickets} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {groupedBatches.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No hay entradas generadas</CardTitle>
            <CardDescription>
              Usa el "Generador de Entradas" para crear nuevos lotes.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {groupedBatches.map((batch) => (
            <AccordionItem value={batch.batch_name} key={batch.batch_name} className="border rounded-lg">
              <div className="flex items-center p-4">
                <AccordionTrigger className="flex-1 text-left p-0 hover:no-underline">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {batch.batch_name}
                      <span className="text-muted-foreground font-normal ml-2">(x{batch.tickets.length})</span>
                    </h3>
                  </div>
                </AccordionTrigger>
                <Button onClick={() => handleDownloadPdf(batch)} disabled={!!downloading} size="sm" className="ml-4">
                  {downloading === batch.batch_name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  PDF
                </Button>
              </div>
              <AccordionContent>
                <p className="px-4 pb-4 text-sm text-muted-foreground">
                  Se han generado {batch.tickets.length} entradas en este lote. Haz clic en "PDF" para descargarlas todas.
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
              userName="Invitado"
              onRendered={() => handleTicketRendered(ticket.ticket_name, pdfContent.length)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
