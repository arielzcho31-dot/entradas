"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar, MapPin, Tag as TagIcon, Clock } from 'lucide-react';

interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  status: string;
  category?: string;
  min_price?: number;
  is_informative?: boolean;
}

const categories = ['Todos', 'Música', 'Deportes', 'Arte', 'Tecnología', 'Comida', 'Otros'];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!authLoading && user && !hasRedirected.current) {
      if (user.role === 'validator') {
        hasRedirected.current = true;
        router.replace('/dashboard/validator');
        return;
      } else if (user.role === 'organizer') {
        hasRedirected.current = true;
        router.replace('/dashboard/organizer');
        return;
      } else if (user.role === 'admin') {
        hasRedirected.current = true;
        router.replace('/dashboard');
        return;
      }
    }
    // Si es usuario normal o no está logueado, cargar eventos
    if (!authLoading && !hasRedirected.current) {
      fetchEvents();
    }
  }, [user, authLoading, router]);

  const shouldRedirect = !!user && ['validator', 'organizer', 'admin'].includes(user.role);

  // Mostrar loader solo si está en proceso de redirección por rol especial
  if (!authLoading && shouldRedirect) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-sm text-muted-foreground">Redirigiendo...</span>
      </div>
    );
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        // Mostrar todos EXCEPTO los ocultos (hidden)
        const visibleEvents = data.filter((event: Event) => event.status !== 'hidden');
        setEvents(visibleEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventClick = (eventSlug: string) => {
    router.push(`/events/${eventSlug}`);
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
            <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
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
                      <TagIcon className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  {/* Estado Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className={
                        event.status === 'active' 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : event.status === 'ended'
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : event.status === 'cancelled'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }
                    >
                      {event.status === 'active' ? 'Activo' : event.status === 'ended' ? 'Finalizado' : event.status === 'cancelled' ? 'Cancelado' : 'Oculto'}
                    </Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-500" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-sky-500" />
                      <span>
                        {new Date(event.event_date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-sky-500" />
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
                    {!event.is_informative && (
                      <span className="text-sky-600 font-bold text-lg ml-auto">
                        {formatPrice(event.min_price)}
                      </span>
                    )}
                    {event.is_informative && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full ml-auto">
                        Informativo
                      </span>
                    )}
                  </div>

                  <Button 
                    className={`w-full mt-4 rounded-lg ${
                      event.is_informative 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-sky-500 hover:bg-sky-600 text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event.slug);
                    }}
                  >
                    {event.is_informative ? 'Ver Detalles' : 'Conseguir Entradas'}
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
