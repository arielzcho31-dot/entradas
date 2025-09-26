import Image from 'next/image';
import { notFound } from 'next/navigation';
import { events } from '@/lib/placeholder-data';
import {
  Calendar,
  Ticket,
  Users,
  Tag,
  Minus,
  Plus,
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
import SuggestedContent from '@/components/events/suggested-content';

export function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }));
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = events.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="relative mb-4 h-96 w-full overflow-hidden rounded-lg shadow-lg">
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
        
        <div className="sticky top-24 h-fit">
            <Card>
                <CardHeader>
                    <CardTitle>Buy Tickets</CardTitle>
                    <CardDescription>Limit 5 tickets per person</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">Price per ticket</span>
                            <span className="text-2xl font-bold text-primary">${event.price.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Quantity</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-10 text-center text-lg font-bold">1</span>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                             <span className="text-xl font-semibold">Total</span>
                             <span className="text-3xl font-extrabold text-primary">${event.price.toFixed(2)}</span>
                        </div>
                         <Button size="lg" className="w-full">
                            <Ticket className="mr-2 h-5 w-5" />
                            Purchase
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
       <div className="mt-12">
            <SuggestedContent event={event} />
        </div>
    </div>
  );
}
