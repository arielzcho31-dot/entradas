import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Event = {
  id: string;
  name: string;
  description: string;
  price: number;
  availableTickets: number;
  category: string;
  date: string;
  imageUrl: string;
  imageHint: string;
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

export const events: Event[] = [
  {
    id: '1',
    name: 'Starlight Music Festival',
    description: 'An unforgettable night under the stars with the world\'s top DJs and artists. Experience music like never before.',
    price: 85.0,
    availableTickets: 2500,
    category: 'Music',
    date: '2024-10-26T19:00:00Z',
    ...findImage('event-1'),
  },
  {
    id: '2',
    name: 'Innovate & Inspire Tech Summit',
    description: 'Join industry leaders and visionaries to explore the future of technology, AI, and sustainable innovation.',
    price: 250.0,
    availableTickets: 500,
    category: 'Conference',
    date: '2024-11-12T09:00:00Z',
    ...findImage('event-2'),
  },
  {
    id: '3',
    name: 'Urban Bites Food Fair',
    description: 'A culinary journey through the city\'s best street food. Taste global flavors and enjoy live cooking demos.',
    price: 25.0,
    availableTickets: 1200,
    category: 'Food',
    date: '2024-09-15T12:00:00Z',
    ...findImage('event-3'),
  },
  {
    id: '4',
    name: 'Champions Cup Final',
    description: 'Witness history as the top two teams battle for the ultimate prize in the most anticipated match of the year.',
    price: 120.0,
    availableTickets: 800,
    category: 'Sports',
    date: '2024-11-30T15:00:00Z',
    ...findImage('event-4'),
  },
  {
    id: '5',
    name: 'Modern Perspectives Art Show',
    description: 'Explore a curated collection of contemporary art from emerging talents around the globe.',
    price: 30.0,
    availableTickets: 300,
    category: 'Art',
    date: '2024-10-05T10:00:00Z',
    ...findImage('event-5'),
  },
  {
    id: '6',
    name: 'City Marathon 2024',
    description: 'Join thousands of runners in the annual city marathon. A test of endurance and spirit for all participants.',
    price: 50.0,
    availableTickets: 3000,
    category: 'Sports',
    date: '2024-10-20T07:00:00Z',
    ...findImage('event-6'),
  },
  {
    id: '7',
    name: 'Indie Film Festival Gala',
    description: 'A celebration of independent cinema, featuring screenings, Q&A sessions with directors, and an awards ceremony.',
    price: 75.0,
    availableTickets: 150,
    category: 'Film',
    date: '2024-11-08T18:00:00Z',
    ...findImage('event-7'),
  },
  {
    id: '8',
    name: 'Sunrise Yoga & Wellness Retreat',
    description: 'A weekend of tranquility and self-discovery. Reconnect with nature through yoga, meditation, and wellness workshops.',
    price: 350.0,
    availableTickets: 50,
    category: 'Wellness',
    date: '2024-09-28T06:00:00Z',
    ...findImage('event-8'),
  },
];


export const users: User[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'customer', password: 'password123' },
    { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'validator', password: 'password123' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'administrator', password: 'password123' },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'event organizer', password: 'password123' },
    { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'customer', password: 'password123' },
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
      eventId: '2',
      eventName: 'Innovate & Inspire Tech Summit',
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
      eventId: '3',
      eventName: 'Urban Bites Food Fair',
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