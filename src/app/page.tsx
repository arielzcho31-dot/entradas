
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { event } from '@/lib/placeholder-data';
import { Calendar, Ticket, Tag, Music, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] text-white">
        <Image
            src="/fondo.png"
            alt="Concert background"
            fill
            className="object-cover z-0"
            data-ai-hint="concert crowd"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative z-20 container mx-auto max-w-6xl px-4 py-8">
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
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
                    {event.name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-gray-300">
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
                <p className="mt-6 text-lg leading-8 text-gray-200">{event.description}</p>
                
                <div className="mt-10">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
                    <Music className="h-6 w-6 text-amber-400" />
                    Artistas Destacados
                    </h2>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {event.artists.map((artist) => (
                        <div key={artist} className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-300">{artist}</span>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
                
                <div className="lg:col-span-1">
                <Card className="sticky top-24 bg-white/10 backdrop-blur-sm border-gray-500 text-white">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">¡No te lo pierdas!</CardTitle>
                        <CardDescription className="text-gray-300">Consigue tus entradas ahora para una noche inolvidable.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-black" asChild>
                            <Link href={`/events/${event.id}`}>
                                <Ticket className="mr-2 h-5 w-5" />
                                Comprar Entradas
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                </div>
            </div>
        </div>
    </div>
  );
}

