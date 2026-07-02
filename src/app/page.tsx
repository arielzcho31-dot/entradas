'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  price: number;
  is_free: boolean;
  image_url: string;
  status?: string;
  hidden?: boolean;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/events?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();
        const processedEvents = data
          .filter((event: Event) => {
            const isVisible = event.status !== 'hidden' && !event.hidden;
            return isVisible;
          })
          .map((event: Event) => ({
            ...event,
            is_free: event.is_free || event.price === 0,
          }));
        
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [refreshKey]);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500 text-lg">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Concert background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Descubre Tu Próxima <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 italic">Experiencia</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Desde conciertos épicos hasta conferencias transformadoras. Encuentra y reserva tu lugar en los mejores eventos.
          </p>

          {/* Buscador Estilizado */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              🔍
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre, artista o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-700 text-lg transition-all"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Sección de Eventos */}
        <section>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const isFree = event.is_free || event.price === 0 || !event.price;
                const displayPrice = isFree ? 'GRATIS' : `$${event.price}`;

                return (
                  <div 
                    key={event.id}
                    className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    {/* Imagen del Evento */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-sky-400 to-blue-500">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🎫
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider shadow-sm">
                          Evento
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                      
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-500">
                            📅
                          </div>
                          <span className="font-medium">
                            {new Date(event.event_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-500">
                            📍
                          </div>
                          <span className="font-medium line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 mb-4">
                        
                      </div>

                      <Link href={`/events/${event.slug}`} className="block mb-2">
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                           Ver Detalles
                        </button>
                      </Link>

                      {!isFree && event.price > 0 && (
                        <Link href={`/events/${event.slug}`} className="block">
                          <button className="w-full py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300">
                             Comprar Entradas
                          </button>
                        </Link>
                      )}

                      {isFree && (
                        <Link href={`/events/${event.slug}`} className="block">
                          <button className="w-full py-3 bg-white text-green-600 border-2 border-green-600 rounded-2xl font-bold hover:bg-green-50 transition-all duration-300">
                             Adquirir Entradas
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 mb-4">
                {searchQuery 
                  ? 'No se encontraron eventos con esos criterios'
                  : 'No hay eventos disponibles en este momento'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer Estilizado */}
      <footer className="bg-white border-t border-slate-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎫</span>
            <span className="font-bold text-slate-400">TicketWise © 2026</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-600">Términos</a>
            <a href="#" className="hover:text-blue-600">Privacidad</a>
            <a href="#" className="hover:text-blue-600">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
