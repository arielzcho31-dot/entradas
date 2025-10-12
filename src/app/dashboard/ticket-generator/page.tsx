"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TicketPlus } from 'lucide-react';

export default function TicketGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTickets = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const ticketName = formData.get('ticketName') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);

    if (!ticketName || isNaN(quantity) || quantity <= 0) {
      toast({ variant: "destructive", title: "Datos inválidos", description: "Por favor, ingresa un nombre y una cantidad válida." });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tickets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketName, quantity }),
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
          <form onSubmit={handleGenerateTickets} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketName">Nombre del Lote de Entradas</Label>
              <Input id="ticketName" name="ticketName" placeholder="Ej: Invitados Especiales" required className="bg-white text-black" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input id="quantity" name="quantity" type="number" min="1" placeholder="Ej: 10" required className="bg-white text-black" />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TicketPlus className="mr-2 h-4 w-4" />}
              Generar Entradas
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
