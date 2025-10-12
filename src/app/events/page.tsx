"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { event as eventData } from '@/lib/placeholder-data'; // Usando datos de placeholder

export default function EventsListPage() {
  // En un futuro, aquí podrías hacer un fetch para obtener una lista de eventos
  const events = [eventData]; // Por ahora, usamos el evento de los datos de placeholder

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight">Eventos Disponibles</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explora nuestros próximos eventos y asegura tu lugar.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader>
              {event.imageUrl && (
                <div className="relative aspect-video w-full mb-4">
                  <Image
                    src={event.imageUrl}
                    alt={event.name}
                    fill
                    className="rounded-t-lg object-cover"
                  />
                </div>
              )}
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>{new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>Comprar Entradas</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
