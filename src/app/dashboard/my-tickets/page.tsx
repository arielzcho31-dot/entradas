
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Ticket, AlertTriangle, CheckCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MyTicketsPage() {
    const { user, loading: authLoading } = useAuth();
    const [ticket, setTicket] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const ticketsRef = collection(db, "tickets");
            // The query was incorrect, it should only query by userId.
            const q = query(ticketsRef, where("userId", "==", user.id));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    // Assuming one ticket per user for this event
                    const ticketDoc = querySnapshot.docs[0];
                    setTicket(ticketDoc.data());
                } else {
                    setTicket(null); // Explicitly set to null if no ticket is found
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching ticket:", error);
                // In a real app, you'd want to handle this error more gracefully
                setLoading(false);
            });

            return () => unsubscribe();
        } else if (!authLoading) {
            // If there's no user and we are not in an auth loading state, stop loading.
            setLoading(false);
        }
    }, [user, authLoading]);

    const renderTicketStatus = () => {
        if (!ticket) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No se encontró ninguna entrada</AlertTitle>
                    <AlertDescription>
                        No parece que tengas una entrada asociada a tu cuenta. Si crees que esto es un error, por favor contacta a soporte.
                    </AlertDescription>
                </Alert>
            );
        }

        switch (ticket.status) {
            case 'disabled':
                return (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertTitle>Pago Pendiente de Verificación</AlertTitle>
                        <AlertDescription>
                            Hemos recibido tu comprobante. Nuestro equipo lo está revisando. Tu QR aparecerá aquí una vez que el pago sea aprobado.
                        </AlertDescription>
                    </Alert>
                );
            case 'enabled':
                return (
                    <div className="flex flex-col items-center gap-6">
                        <Alert variant="default" className="border-green-500 text-green-700">
                             <CheckCircle className="h-4 w-4 text-green-500" />
                            <AlertTitle>¡Entrada Habilitada!</AlertTitle>
                            <AlertDescription>
                                Presenta este código QR en el acceso del evento. ¡Que lo disfrutes!
                            </AlertDescription>
                        </Alert>
                        <div className="bg-white p-4 rounded-lg shadow-inner">
                            <QRCodeSVG 
                                value={ticket.ticketCode} 
                                size={256} 
                                includeMargin={true}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                            {ticket.ticketCode}
                        </p>
                    </div>
                );
            case 'used':
                return (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Entrada Ya Utilizada</AlertTitle>
                        <AlertDescription>
                            Este código QR ya fue escaneado en el acceso al evento el {ticket.usedAt?.toDate().toLocaleString('es-ES') || 'en una fecha anterior'}.
                        </AlertDescription>
                    </Alert>
                );
            default:
                return <p>Estado desconocido. Contacta a soporte.</p>;
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }
     if (!user) {
        return (
             <div className="flex justify-center items-center py-20">
                <p>Debes iniciar sesión para ver tus entradas.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-2xl py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ticket className="h-6 w-6 text-primary"/>
                        Mi Entrada para UnidaFest 2025
                    </CardTitle>
                    <CardDescription>
                        Aquí puedes ver el estado de tu entrada y tu código QR para el acceso.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                    {renderTicketStatus()}
                </CardContent>
            </Card>
        </div>
    );
}
