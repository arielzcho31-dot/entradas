import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Event = {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  location: string;
  imageUrl: string;
  imageHint: string;
  artists: string[];
};

export type TicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  availableTickets: number;
};


export type User = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'validator' | 'admin' | 'organizer';
};

export type Sale = {
  id: string;
  eventId: string;
  eventName: string;
  customerId: string;
  customerName: string;
  validatorId: string;
  validatorName: string;
  tickets: number;
  totalPrice: number;
  paymentStatus: 'Pending' | 'Verified';
  saleDate: string;
};

const findImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return {
    imageUrl: image?.imageUrl ?? 'https://picsum.photos/seed/placeholder/600/400',
    imageHint: image?.imageHint ?? 'placeholder image',
  };
};

export const event: Event = {
    id: '1',
    name: 'UnidaFest 2025',
    description: 'Una noche inolvidable bajo las estrellas con los mejores DJs y artistas del mundo. Vive la música como nunca antes.',
    category: 'Música',
    date: '2025-11-14T19:00:00Z',
    location: 'Estacionamiento Unida',
    ...findImage('event-1'),
    artists: [
        'kchiporros',
        'japiaguar',
        'chapa-c',
        'marilina',
    ]
};

export const ticketTypes: TicketType[] = [
  {
    id: 't1',
    name: 'Acceso General',
    description: 'Acceso a las áreas principales y escenarios del festival.',
    price: 35000,
    availableTickets: 2000,
  },
  {
    id: 't2',
    name: 'Lounge VIP',
    description: 'Acceso exclusivo al lounge VIP con vistas premium y comodidades.',
    price: 65000,
    availableTickets: 500,
  },
  {
    id: 't3',
    name: 'Pase Backstage',
    description: 'Accede al detrás de cámaras con un pase de acceso total.',
    price: 150000,
    availableTickets: 50,
  }
];

export const sales: Sale[] = [
    {
      id: 'S1001',
      eventId: '1',
      eventName: 'Starlight Music Festival',
      customerId: '1',
      customerName: 'Alice Johnson',
      validatorId: '2',
      validatorName: 'Bob Williams',
      tickets: 2,
      totalPrice: 170.00,
      paymentStatus: 'Verified',
      saleDate: '2024-08-01T10:30:00Z',
    },
    {
      id: 'S1002',
      eventId: '1',
      eventName: 'Starlight Music Festival',
      customerId: '5',
      customerName: 'Ethan Hunt',
      validatorId: '2',
      validatorName: 'Bob Williams',
      tickets: 1,
      totalPrice: 250.00,
      paymentStatus: 'Pending',
      saleDate: '2024-08-02T14:00:00Z',
    },
    {
      id: 'S1003',
      eventId: '1',
      eventName: 'Starlight Music Festival',
      customerId: '1',
      customerName: 'Alice Johnson',
      validatorId: '2',
      validatorName: 'Bob Williams',
      tickets: 4,
      totalPrice: 100.00,
      paymentStatus: 'Verified',
      saleDate: '2024-08-03T11:45:00Z',
    },
  ];

