"use client";

import Image from 'next/image';
import { event, ticketTypes } from '@/lib/placeholder-data';
import { Calendar, Ticket, Minus, Plus, Tag, Music, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

type Quantities = {
  [key: string]: number;
};

export default function Home() {
  const [quantities, setQuantities] = useState<Quantities>(
    ticketTypes.reduce((acc, type) => {
      acc[type.id] = 0;
      return acc;
    }, {} as Quantities)
  );

  const handleQuantityChange = (ticketId: string, amount: number) => {
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, Math.min(5, prev[ticketId] + amount)),
    }));
  };

  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = ticketTypes.reduce(
    (sum, type) => sum + type.price * quantities[type.id],
    0
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Event Info */}
      <div className="relative mb-6 h-[300px] w-full overflow-hidden rounded-lg shadow-lg md:h-[450px]">
        <Image
          src={event.imageUrl}
          alt={event.name}
          fill
          className="object-cover"
          data-ai-hint={event.imageHint}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {event.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span>{event.category}</span>
            </div>
          </div>
          <p className="mt-6 text-lg leading-8">{event.description}</p>
          
          <div className="mt-10">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              Artistas Destacados
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
              {event.artists.map((artist) => (
                <div key={artist} className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{artist}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
           <Card className="sticky top-24">
             <CardHeader>
                <CardTitle className="text-xl">¡No te lo pierdas!</CardTitle>
                <CardDescription>Consigue tus entradas ahora para una noche inolvidable.</CardDescription>
             </CardHeader>
             <CardContent>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" className="w-full">
                            <Ticket className="mr-2 h-5 w-5" />
                            Comprar Entradas
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Comprar Entradas</DialogTitle>
                            <DialogDescription>
                                Selecciona tu tipo de entrada. Límite 5 por tipo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                            {/* Ticket Types */}
                            <div className="space-y-4">
                                {ticketTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                    <h3 className="font-semibold">{type.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                        ${type.price.toFixed(2)}
                                    </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleQuantityChange(type.id, -1)}
                                        disabled={quantities[type.id] === 0}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-10 text-center text-lg font-bold">
                                        {quantities[type.id]}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleQuantityChange(type.id, 1)}
                                        disabled={quantities[type.id] === 5}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    </div>
                                </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Totals and Purchase */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                <span className="text-xl font-semibold">Total</span>
                                <span className="text-3xl font-extrabold text-primary">
                                    ${totalPrice.toFixed(2)}
                                </span>
                                </div>
                                <Button
                                size="lg"
                                className="w-full"
                                disabled={totalTickets === 0}
                                >
                                <Ticket className="mr-2 h-5 w-5" />
                                Comprar ({totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'})
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
