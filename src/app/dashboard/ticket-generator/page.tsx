"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TicketPlus } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  date: string;
}

export default function TicketGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id);
          }
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los eventos." });
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [toast]);

  const handleGenerateTickets = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const ticketName = formData.get('ticketName') as string;
    const userName = formData.get('userName') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);

    if (!selectedEventId) {
      toast({ variant: "destructive", title: "Evento requerido", description: "Por favor, selecciona un evento." });
      setIsLoading(false);
      return;
    }

    if (!ticketName || !userName || isNaN(quantity) || quantity <= 0) {
      toast({ variant: "destructive", title: "Datos inválidos", description: "Por favor, completa todos los campos." });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tickets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketName, userName, quantity, eventId: selectedEventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudieron generar las entradas.');
      }

      toast({ title: "¡Éxito!", description: `${quantity} entradas de "${ticketName}" han sido generadas.` });
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generador de Entradas</h1>
        <p className="text-foreground">
          Crea lotes de entradas para invitados, cortesías o ventas manuales.
        </p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Generar Nuevas Entradas</CardTitle>
          <CardDescription>
            Las entradas generadas no estarán asociadas a ningún usuario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay eventos disponibles. Crea un evento primero.</p>
            </div>
          ) : (
            <form onSubmit={handleGenerateTickets} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventId">Evento *</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId} required>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} - {new Date(event.date).toLocaleDateString('es-ES')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketName">Nombre del Lote de Entradas</Label>
                <Input id="ticketName" name="ticketName" placeholder="Ej: Invitados Especiales" required className="bg-white text-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">Nombre del Usuario/Invitado *</Label>
                <Input id="userName" name="userName" placeholder="Ej: Juan Pérez" required className="bg-white text-black" />
                <p className="text-sm text-gray-500">Este nombre aparecerá en todas las entradas del lote</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="text"
                  inputMode="numeric"
                  min="1" 
                  placeholder="Ej: 10" 
                  required 
                  className="bg-white text-black"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                  }}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TicketPlus className="mr-2 h-4 w-4" />}
                Generar Entradas
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
