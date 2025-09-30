
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Shield, ScanLine, Home, Ticket } from "lucide-react";
import Link from "next/link";
import { event } from "@/lib/placeholder-data";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
             <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <p>Cargando...</p>
            </div>
        )
    }

    const canSeeAdmin = user.role === 'admin';
    const canSeeValidator = ['admin', 'validator'].includes(user.role);
    const canSeeOrganizer = ['admin', 'organizer', 'validator'].includes(user.role);


    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Bienvenido a tu Dashboard</h1>
            <p className="text-muted-foreground mb-8">
                Selecciona una acción para continuar. Las opciones disponibles dependen de tu rol.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Link href="/">
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-6 w-6 text-primary" />
                                <span>Página Principal</span>
                            </CardTitle>
                            <CardDescription>Vuelve a la página de inicio del evento.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href={`/events/${event.id}`}>
                    <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ticket className="h-6 w-6 text-primary" />
                                <span>Comprar Entradas</span>
                            </CardTitle>
                            <CardDescription>Ve a la página de compra de entradas.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                {canSeeAdmin && (
                    <Link href="/dashboard/admin">
                        <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart2 className="h-6 w-6 text-primary" />
                                    <span>Administrador</span>
                                </CardTitle>
                                <CardDescription>Supervisa todas las operaciones, usuarios y datos de ventas.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                )}
                 {canSeeValidator && (
                    <Link href="/dashboard/validator">
                        <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-primary" />
                                    <span>Validador</span>
                                </CardTitle>
                                <CardDescription>Verifica pagos y confirma la venta de entradas.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                 )}
                 {canSeeOrganizer && (
                    <Link href="/dashboard/organizer">
                        <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ScanLine className="h-6 w-6 text-primary" />
                                    <span>Organizador</span>
                                </CardTitle>
                                <CardDescription>Gestiona el acceso al evento escaneando las entradas.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                 )}
            </div>
        </div>
    )
}
