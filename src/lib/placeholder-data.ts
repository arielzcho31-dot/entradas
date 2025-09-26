import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Event = {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  imageUrl: string;
  imageHint: string;
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
  role: 'customer' | 'validator' | 'administrator' | 'event organizer';
  password?: string;
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
    description: 'An unforgettable night under the stars with the world\'s top DJs and artists. Experience music like never before.',
    category: 'Music',
    date: '2024-10-26T19:00:00Z',
    ...findImage('event-1'),
};

export const ticketTypes: TicketType[] = [
  {
    id: 't1',
    name: 'General Access',
    description: 'Access to the main festival grounds and stages.',
    price: 85.0,
    availableTickets: 2000,
  },
  {
    id: 't2',
    name: 'VIP Lounge',
    description: 'Exclusive access to the VIP lounge with premium views and amenities.',
    price: 150.0,
    availableTickets: 500,
  },
  {
    id: 't3',
    name: 'Backstage Pass',
    description: 'Get behind the scenes with an all-access backstage pass.',
    price: 300.0,
    availableTickets: 50,
  }
];


export const users: User[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'customer' },
    { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'validator' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'administrator' },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'event organizer' },
    { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'customer' },
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

