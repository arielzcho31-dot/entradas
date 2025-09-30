
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { event } from '@/lib/placeholder-data';
import { Calendar, Ticket, Tag, Music, User, MapPin, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {

  const unidaImage = PlaceHolderImages.find(img => img.id === 'unida-campus');

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="object-cover"
            data-ai-hint={event.imageHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 text-center text-white p-4">
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            {event.name}
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-lg font-medium">
            <div className="flex items-center gap-2 backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{new Date(event.date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-200">
            {event.description}
          </p>
          <div className="mt-10">
            <Button size="lg" className="h-14 w-full max-w-sm bg-amber-500 text-xl font-bold text-black shadow-lg transition-transform hover:scale-105 hover:bg-amber-600" asChild>
              <Link href={`/events/${event.id}`}>
                <Ticket className="mr-3 h-7 w-7" />
                Comprar Entradas
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Artists Line-up Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight sm:text-5xl">
              <Music className="h-10 w-10 text-primary" />
              Line-up de Artistas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Conoce a las estrellas que iluminarán la noche del UnidaFest.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {event.artists.map((artist) => (
              <Card key={artist.id} className="overflow-hidden text-center transition-all hover:shadow-xl hover:-translate-y-2">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image src={artist.imageUrl} alt={artist.name} fill className="object-cover" data-ai-hint={artist.imageHint} />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl">{artist.name}</CardTitle>
                  <CardDescription className="mt-2 h-20">{artist.bio}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About UNIDA Section */}
      {unidaImage && (
        <section className="py-20">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div className="relative h-64 w-full rounded-lg shadow-lg overflow-hidden md:h-80">
                  <Image src={unidaImage.imageUrl} alt="UNIDA Campus" fill className="object-cover" data-ai-hint={unidaImage.imageHint} />
              </div>
              <div className="text-center md:text-left">
                  <h2 className="flex items-center justify-center md:justify-start gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
                      <School className="h-8 w-8 text-primary" />
                      Sobre los Organizadores
                  </h2>
                  <h3 className="mt-2 text-xl font-semibold text-primary">Universidad de la Integración de las Américas</h3>
                  <p className="mt-4 text-muted-foreground">
                      El UnidaFest es una iniciativa de la UNIDA para fomentar la cultura, el arte y la integración entre los jóvenes. Creemos en el poder de la música para unir a las personas y crear experiencias memorables que fortalezcan el espíritu comunitario y el desarrollo integral de nuestros estudiantes.
                  </p>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
