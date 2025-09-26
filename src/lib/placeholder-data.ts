import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Event = {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
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
  password?: string; // Made password optional for flexibility
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
    name: 'Starlight Music Festival',
    description: 'Una noche inolvidable bajo las estrellas con los mejores DJs y artistas del mundo. Vive la música como nunca antes.',
    category: 'Música',
    date: '2024-10-26T19:00:00Z',
    ...findImage('event-1'),
    artists: [
        'DJ Stardust',
        'Cosmic Beats',
        'Galaxy Grooves',
        'The Orion Experience',
        'Luna Waves',
        'Astrofunk',
        'Nebula Nine',
        'Meteor Sound',
    ]
};

export const ticketTypes: TicketType[] = [
  {
    id: 't1',
    name: 'General Access',
    description: 'Acceso a las áreas principales y escenarios del festival.',
    price: 85.0,
    availableTickets: 2000,
  },
  {
    id: 't2',
    name: 'VIP Lounge',
    description: 'Acceso exclusivo al lounge VIP con vistas premium y comodidades.',
    price: 150.0,
    availableTickets: 500,
  },
  {
    id: 't3',
    name: 'Backstage Pass',
    description: 'Accede al detrás de cámaras con un pase de acceso total.',
    price: 300.0,
    availableTickets: 50,
  }
];


export const users: User[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'customer' },
    { id: '2', name: 'Bob Williams', email: 'bob@example.com', password: 'password123', role: 'validator' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: 'admin' },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: 'organizer' },
    { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', password: 'password123', role: 'customer' },
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
