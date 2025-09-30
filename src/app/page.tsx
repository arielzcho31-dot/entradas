
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { event } from '@/lib/placeholder-data';
import { Calendar, Ticket, Tag, Music, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={event.imageUrl}
          alt={event.name}
          fill
          className="object-cover"
          data-ai-hint={event.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            {event.name}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-lg text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                {new Date(event.date).toLocaleDateString('es-ES', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <span>{event.category}</span>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/80">
            {event.description}
          </p>

          <div className="mt-10">
            <Button size="lg" className="h-12 w-full max-w-xs bg-amber-500 text-lg font-bold text-black shadow-lg transition-transform hover:scale-105 hover:bg-amber-600" asChild>
              <Link href={`/events/${event.id}`}>
                <Ticket className="mr-2 h-6 w-6" />
                Comprar Entradas
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-background/80 py-16 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-8 flex items-center justify-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <Music className="h-8 w-8 text-primary" />
            Line-up de Artistas
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-center sm:grid-cols-4">
            {event.artists.map((artist) => (
              <div key={artist} className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted">
                <User className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium capitalize text-foreground/90">{artist.replace(/-/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
