"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  status?: string;
  hidden?: boolean;
  category?: string;
  price?: number;
  min_price?: number;
}

const categories = ['Todos', 'Música', 'Deportes', 'Arte', 'Tecnología', 'Comida'];

export default function HomeEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/events?_t=${timestamp}`, {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar: solo eventos NO ocultos y NO con status 'hidden'
        const visibleEvents = data.filter(
          (event: Event) => event.status !== 'hidden' && !event.hidden
        );
        setEvents(visibleEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || (event.category && event.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleEventClick = (eventSlug: string) => {
    router.push(`/events/${eventSlug}`);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratis';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-sky-400 to-blue-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Descubre Tu Próxima Experiencia
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-sky-50">
            Desde conciertos hasta conferencias, encuentra y reserva entradas para los mejores eventos
          </p>
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Buscar eventos por nombre, ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 text-lg bg-white text-black border-0 shadow-xl rounded-full px-6"
            />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Próximos Eventos
        </h2>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`rounded-full px-6 py-2 ${
                selectedCategory === category
                  ? 'bg-sky-500 text-white hover:bg-sky-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">
              {searchQuery || selectedCategory !== 'Todos'
                ? 'No se encontraron eventos con esos criterios'
                : 'No hay eventos disponibles en este momento'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.slug)}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-500">
                      <span className="text-4xl">🎫</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>
                        {new Date(event.event_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    {event.category && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {event.category}
                      </span>
                    )}
                    <span className="text-sky-600 font-bold text-lg ml-auto">
                      {formatPrice(event.min_price || event.price)}
                    </span>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event.slug);
                    }}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
