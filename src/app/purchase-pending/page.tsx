"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PurchasePendingPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="mt-4 text-2xl font-bold">¡Solicitud Recibida!</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Tu comprobante ha sido enviado y está pendiente de validación. Recibirás una notificación cuando tus entradas estén listas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/dashboard/my-tickets">Ver Mis Entradas</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
