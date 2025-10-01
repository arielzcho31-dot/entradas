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
  artists: Artist[];
};

export type Artist = {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  imageHint: string;
};

export type TicketType = {
  id: string;
  name:string;
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
  if (!image) {
    console.warn(`Image with id "${id}" not found. Using placeholder.`);
    return {
      imageUrl: 'https://picsum.photos/seed/placeholder/600/400',
      imageHint: 'placeholder image',
    };
  }
  return {
    imageUrl: image.imageUrl,
    imageHint: image.imageHint,
  };
};

export const event: Event = {
    id: '1',
    name: 'UnidaFest 2025',
    description: 'Una noche inolvidable bajo las estrellas con los mejores DJs y artistas del mundo. Vive la música como nunca antes.',
    category: 'Música',
    date: '2025-11-14T19:00:00Z',
    location: 'Estacionamiento Unida',
    ...findImage('event-main-collage'),
    artists: [
        {
          id: 'kchiporros',
          name: 'Kchiporros',
          bio: 'La banda que revolucionó la cumbia paraguaya con su energía contagiosa y un estilo único que fusiona ritmos latinos.',
          ...findImage('artist-kchiporros'),
        },
        {
          id: 'japiaguar',
          name: 'Japiaguar',
          bio: 'Con su mezcla de cumbia, reggae y rock, Japiaguar trae una propuesta fresca y vibrante que te hará bailar toda la noche.',
          ...findImage('artist-japiaguar'),
        },
        {
          id: 'qmbia-juan',
          name: 'Qmbia Juan',
          bio: 'El fenómeno de la cumbia que te pondrá a gozar con sus ritmos pegajosos y su carisma inigualable. ¡Imposible no bailar!',
           ...findImage('artist-qmbia-juan'),
        },
        {
          id: 'dj-preda',
          name: 'DJ Preda',
          bio: 'El DJ que está rompiendo esquemas con sus sets explosivos. Una mezcla de los mejores hits que te mantendrá en la pista.',
           ...findImage('artist-dj-preda'),
        }
    ]
};

export const ticketTypes: TicketType[] = [
  {
    id: 't1',
    name: 'Acceso General',
    description: 'Acceso a las áreas principales y escenarios del festival.',
    price: 35000,
    availableTickets: 2000,
  }
];

export const sales: Sale[] = [
    {
      id: 'S1001',
      eventId: '1',
      eventName: 'UnidaFest 2025',
      customerId: '1',
      customerName: 'Alice Johnson',
      validatorId: '2',
      validatorName: 'Bob Williams',
      tickets: 2,
      totalPrice: 130000,
      paymentStatus: 'Verified',
      saleDate: '2024-08-01T10:30:00Z',
    },
    {
      id: 'S1002',
      eventId: '1',
      eventName: 'UnidaFest 2025',
      customerId: '5',
      customerName: 'Ethan Hunt',
      validatorId: '2',
      validatorName: 'Bob Williams',
      tickets: 1,
      totalPrice: 150000,
      paymentStatus: 'Pending',
      saleDate: '2024-08-02T14:00:00Z',
    },
    {
      id: 'S1003',
      eventId: '1',
      eventName: 'UnidaFest 2025',
      customerId: '1',
      customerName: 'Alice Johnson',
      validatorId: '2',
      validatorName: 'Bob Williams',
      tickets: 4,
      totalPrice: 140000,
      paymentStatus: 'Verified',
      saleDate: '2024-08-03T11:45:00Z',
    },
  ];


    
