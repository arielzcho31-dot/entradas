// src/lib/validators.ts
// Esquemas de validación centralizados con Zod

import { z } from 'zod';

// ===== AUTH SCHEMAS =====
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener mínimo 8 caracteres')
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener mínimo 8 caracteres'),
  display_name: z.string().min(2, 'Nombre debe tener mínimo 2 caracteres'),
  ci: z.string().optional(),
  usuario: z.string().optional(),
  numero: z.string().optional(),
  universidad: z.string().optional()
});

// ===== TICKET SCHEMAS =====
export const createTicketSchema = z.object({
  eventId: z.string().uuid('Event ID inválido'),
  ticketTypeId: z.string().uuid('Ticket type ID inválido'),
  userName: z.string().min(1, 'Nombre requerido'),
  qrCode: z.string().optional()
});

export const validateTicketSchema = z.object({
  ticketId: z.string().uuid('Ticket ID inválido'),
  validatorId: z.string().uuid('Validator ID inválido')
});

// ===== EVENT SCHEMAS =====
export const createEventSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(255),
  description: z.string().optional(),
  date: z.string().datetime('Fecha inválida'),
  location: z.string().min(1, 'Ubicación requerida'),
  organizerId: z.string().uuid('Organizer ID inválido')
});

// ===== ORDER SCHEMAS =====
export const createOrderSchema = z.object({
  eventId: z.string().uuid('Event ID inválido'),
  tickets: z.array(
    z.object({
      ticketTypeId: z.string().uuid('Ticket type ID inválido'),
      quantity: z.number().int().min(1, 'Cantidad mínima 1')
    })
  ).min(1, 'Debe haber al menos 1 ticket')
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
