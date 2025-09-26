import EventCard from '@/components/events/event-card';
import { events } from '@/lib/placeholder-data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Upcoming Events
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your next unforgettable experience is just a click away.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
