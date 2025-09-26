import Image from 'next/image';
import Link from 'next/link';
import type { Event } from '@/lib/placeholder-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Ticket } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-48 w-full">
        <Image
          src={event.imageUrl}
          alt={event.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          data-ai-hint={event.imageHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{event.name}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1 text-sm">
          <Calendar className="h-4 w-4" />
          {new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {event.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between">
            <Badge variant="secondary">{event.category}</Badge>
            <p className="text-lg font-bold text-primary">${event.price.toFixed(2)}</p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>
            <Ticket className="mr-2 h-4 w-4" />
            Get Tickets
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
