
"use client";

import Image from 'next/image';
import { event, ticketTypes } from '@/lib/placeholder-data';
import {
  Calendar,
  Ticket,
  Minus,
  Plus,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

type Quantities = {
  [key: string]: number;
};

export default function EventCard() {
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
  const totalPrice = ticketTypes.reduce((sum, type) => sum + type.price * quantities[type.id], 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Event Info */}
        <div>
          <div className="relative mb-4 h-[450px] w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              className="object-cover"
              data-ai-hint={event.imageHint}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {event.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
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
          <p className="mt-6 text-base leading-7">{event.description}</p>
        </div>
        
        {/* Ticket Purchasing */}
        <div className="sticky top-24 h-fit">
            <Card>
                <CardHeader>
                    <CardTitle>Buy Tickets</CardTitle>
                    <CardDescription>Select your ticket type. Limit 5 per type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Ticket Types */}
                        <div className="space-y-4">
                          {ticketTypes.map((type) => (
                            <div key={type.id} className="flex items-center justify-between rounded-lg border p-4">
                              <div>
                                <h3 className="font-semibold">{type.name}</h3>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                <p className="text-lg font-bold text-primary">${type.price.toFixed(2)}</p>
                              </div>
                               <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(type.id, -1)} disabled={quantities[type.id] === 0}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-10 text-center text-lg font-bold">{quantities[type.id]}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(type.id, 1)} disabled={quantities[type.id] === 5}>
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
                             <span className="text-3xl font-extrabold text-primary">${totalPrice.toFixed(2)}</span>
                           </div>
                           <Button size="lg" className="w-full" disabled={totalTickets === 0}>
                              <Ticket className="mr-2 h-5 w-5" />
                              Purchase ({totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'})
                          </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
